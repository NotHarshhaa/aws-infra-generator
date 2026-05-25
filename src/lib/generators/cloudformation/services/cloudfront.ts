import { CloudFormationTemplate, ServiceBuilderResult } from '../types';

export function buildCloudFront(cfg: Record<string, any>, environment: string, projectName: string): ServiceBuilderResult {
  const priceClass = cfg.price_class || "PriceClass_100";
  const defaultTtl = cfg.default_ttl || 86400;
  const enableCompress = cfg.enable_compress !== false;
  const httpsOnly = cfg.enable_https_only !== false;

  const resources: any = {
    CloudFrontDistribution: {
      Type: "AWS::CloudFront::Distribution",
      Properties: {
        DistributionConfig: {
          Enabled: true,
          IsIPV6Enabled: true,
          Comment: `${projectName} (${environment}) distribution`,
          DefaultRootObject: "index.html",
          PriceClass: priceClass,
          Origins: [
            {
              Id: "S3Origin",
              DomainName: { "Fn::GetAtt": ["S3Bucket", "RegionalDomainName"] },
              S3OriginConfig: {
                OriginAccessIdentity: {
                  "Fn::Sub": "origin-access-identity/cloudfront/${CloudFrontOriginAccessIdentity}"
                }
              }
            }
          ],
          DefaultCacheBehavior: {
            TargetOriginId: "S3Origin",
            ViewerProtocolPolicy: httpsOnly ? "redirect-to-https" : "allow-all",
            TrustedSigners: [],
            ForwardedValues: {
              QueryString: false,
              Cookies: {
                Forward: "none"
              }
            },
            MinTTL: 0,
            MaxTTL: 31536000,
            DefaultTTL: defaultTtl,
            Compress: enableCompress
          },
          Restrictions: {
            GeoRestriction: {
              RestrictionType: "none"
            }
          },
          ViewerCertificate: {
            CloudFrontDefaultCertificate: true
          }
        }
      }
    },
    CloudFrontOriginAccessIdentity: {
      Type: "AWS::CloudFront::CloudFrontOriginAccessIdentity",
      Properties: {
        CloudFrontOriginAccessIdentityConfig: {
          Comment: `Origin Access Identity for ${projectName} (${environment})`
        }
      }
    },
    S3BucketPolicy: {
      Type: "AWS::S3::BucketPolicy",
      Properties: {
        Bucket: { "Ref": "S3Bucket" },
        PolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "AllowCloudFrontServicePrincipal",
              Effect: "Allow",
              Principal: {
                Service: "cloudfront.amazonaws.com"
              },
              Action: "s3:GetObject",
              Resource: {
                "Fn::Join": [
                  "",
                  [
                    { "Fn::GetAtt": ["S3Bucket", "Arn"] },
                    "/*"
                  ]
                ]
              },
              Condition: {
                StringEquals: {
                  "AWS:SourceArn": { "Fn::GetAtt": ["CloudFrontDistribution", "Arn"] }
                }
              }
            }
          ]
        }
      }
    }
  };

  const outputs: any = {
    CloudFrontDistributionDomainName: {
      Description: "CloudFront distribution domain name",
      Value: { "Fn::GetAtt": ["CloudFrontDistribution", "DomainName"] }
    },
    CloudFrontDistributionId: {
      Description: "CloudFront distribution ID",
      Value: { "Ref": "CloudFrontDistribution" }
    }
  };

  return [resources, outputs];
}
