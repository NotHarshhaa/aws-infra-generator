import { GeneratedFile } from '../types';

export function generateApiGateway(
  cfg: Record<string, any>,
  environment: string,
  projectName: string
): GeneratedFile {
  const apiType = cfg.api_type || "rest";
  const stageName = cfg.stage_name || environment;
  const enableCors = cfg.enable_cors !== false;
  const enableLogging = cfg.enable_logging !== false;
  const enableThrottling = cfg.enable_throttling === true;
  const enableWaf = cfg.enable_waf === true;

  const resources: any = {
    Parameters: {
      ApiType: {
        Type: "String",
        Default: apiType,
        AllowedValues: ["rest", "http"],
        Description: "API type",
      },
      StageName: {
        Type: "String",
        Default: stageName,
        Description: "Deployment stage name",
      },
      EnableCors: {
        Type: "String",
        Default: enableCors.toString(),
        AllowedValues: ["true", "false"],
        Description: "Enable CORS",
      },
      EnableLogging: {
        Type: "String",
        Default: enableLogging.toString(),
        AllowedValues: ["true", "false"],
        Description: "Enable logging",
      },
    },
    Resources: {},
    Outputs: {},
  };

  if (apiType === "rest") {
    // REST API Gateway
    resources.Resources.RestApi = {
      Type: "AWS::ApiGateway::RestApi",
      Properties: {
        Name: `${projectName}-${environment}-api`,
        Description: "REST API for " + projectName,
        EndpointConfiguration: {
          Types: ["REGIONAL"],
        },
        Policy: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: "execute-api:Invoke",
              Resource: "arn:aws:execute-api:*:*:*",
            },
          ],
        },
      },
    };

    // API Gateway Resource
    resources.Resources.ApiResource = {
      Type: "AWS::ApiGateway::Resource",
      Properties: {
        RestApiId: { Ref: "RestApi" },
        ParentId: { "Fn::GetAtt": ["RestApi", "RootResourceId"] },
        PathPart: "{proxy+}",
      },
    };

    // API Gateway Method (ANY for proxy)
    resources.Resources.AnyMethod = {
      Type: "AWS::ApiGateway::Method",
      Properties: {
        RestApiId: { Ref: "RestApi" },
        ResourceId: { Ref: "ApiResource" },
        HttpMethod: "ANY",
        AuthorizationType: "NONE",
        ...(enableCors && {
          RequestParameters: {
            "method.request.header.Access-Control-Request-Headers": true,
            "method.request.header.Access-Control-Request-Method": true,
          },
        }),
      },
    };

    // API Gateway Integration
    resources.Resources.ApiIntegration = {
      Type: "AWS::ApiGateway::Integration",
      Properties: {
        RestApiId: { Ref: "RestApi" },
        ResourceId: { Ref: "ApiResource" },
        HttpMethod: "ANY",
        Type: "AWS_PROXY",
        IntegrationHttpMethod: "POST",
        Uri: cfg.lambda_integration === true 
          ? { "Fn::Sub": "arn:aws:apigateway:${AWS::Region}:${AWS::AccountId}:lambda:path/2015-03-31/functions/${LambdaFunction.Arn}/invocations" }
          : { "Fn::Sub": "http://${LoadBalancer.DNSName}" },
        ...(enableCors && {
          RequestParameters: {
            "integration.request.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            "integration.request.header.Access-Control-Allow-Methods": "'GET,POST,PUT,DELETE,OPTIONS'",
            "integration.request.header.Access-Control-Allow-Origin": "'*'",
          },
        }),
      },
    };

    // CORS Method
    if (enableCors) {
      resources.Resources.OptionsMethod = {
        Type: "AWS::ApiGateway::Method",
        Properties: {
          RestApiId: { Ref: "RestApi" },
          ResourceId: { Ref: "ApiResource" },
          HttpMethod: "OPTIONS",
          AuthorizationType: "NONE",
        },
      };

      resources.Resources.OptionsIntegration = {
        Type: "AWS::ApiGateway::Integration",
        Properties: {
          RestApiId: { Ref: "RestApi" },
          ResourceId: { Ref: "ApiResource" },
          HttpMethod: "OPTIONS",
          Type: "MOCK",
          RequestTemplates: {
            "application/json": "{\\\"statusCode\\\": 200}",
          },
        },
      };

      resources.Resources.OptionsMethodResponse = {
        Type: "AWS::ApiGateway::MethodResponse",
        Properties: {
          RestApiId: { Ref: "RestApi" },
          ResourceId: { Ref: "ApiResource" },
          HttpMethod: "OPTIONS",
          StatusCode: "200",
          ResponseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      };

      resources.Resources.OptionsIntegrationResponse = {
        Type: "AWS::ApiGateway::IntegrationResponse",
        Properties: {
          RestApiId: { Ref: "RestApi" },
          ResourceId: { Ref: "ApiResource" },
          HttpMethod: "OPTIONS",
          StatusCode: "200",
          ResponseParameters: {
            "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            "method.response.header.Access-Control-Allow-Methods": "'GET,POST,PUT,DELETE,OPTIONS'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
          },
        },
      };
    }

    // API Gateway Deployment
    resources.Resources.ApiDeployment = {
      Type: "AWS::ApiGateway::Deployment",
      Properties: {
        RestApiId: { Ref: "RestApi" },
      },
      DependsOn: enableCors ? ["OptionsMethod"] : ["AnyMethod"],
    };

    // API Gateway Stage
    const stageProperties: any = {
      RestApiId: { Ref: "RestApi" },
      DeploymentId: { Ref: "ApiDeployment" },
      StageName: { Ref: "StageName" },
      ...(enableThrottling && {
        MethodSettings: {
          "/*/*": {
            ThrottlingRateLimit: cfg.throttle_rate_limit || 100,
            ThrottlingBurstLimit: cfg.throttle_burst_limit || 200,
          },
        },
      }),
      ...(enableLogging && {
        AccessLogSetting: {
          DestinationArn: { "Fn::GetAtt": ["ApiLogGroup", "Arn"] },
          Format: JSON.stringify({
            requestId: "$context.requestId",
            ip: "$context.identity.sourceIp",
            caller: "$context.identity.caller",
            user: "$context.identity.user",
            requestTime: "$context.requestTime",
            httpMethod: "$context.httpMethod",
            resourcePath: "$context.resourcePath",
            status: "$context.status",
            protocol: "$context.protocol",
            responseLength: "$context.responseLength",
          }),
        },
        XrayTracingEnabled: true,
        MethodSettings: {
          "/*/*": {
            LoggingLevel: "INFO",
            MetricsEnabled: true,
            DataTraceEnabled: cfg.data_trace_enabled === true,
          },
        },
      }),
    };

    resources.Resources.ApiStage = {
      Type: "AWS::ApiGateway::Stage",
      Properties: stageProperties,
    };

    // Lambda Permission for API Gateway
    if (cfg.lambda_integration === true) {
      resources.Resources.LambdaApiGatewayPermission = {
        Type: "AWS::Lambda::Permission",
        Properties: {
          FunctionName: { Ref: "LambdaFunction" },
          Action: "lambda:InvokeFunction",
          Principal: "apigateway.amazonaws.com",
          SourceArn: { "Fn::Sub": "arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${RestApi.RootResourceId}/*/*/*" },
        },
      };
    }

    // CloudWatch Log Group for API Gateway
    if (enableLogging) {
      resources.Resources.ApiLogGroup = {
        Type: "AWS::Logs::LogGroup",
        Properties: {
          LogGroupName: `/aws/apigateway/${projectName}-${environment}-api`,
          RetentionInDays: cfg.log_retention_days || 14,
        },
      };
    }

    // Outputs
    resources.Outputs.ApiUrl = {
      Description: "API Gateway URL",
      Value: { "Fn::Sub": "https://${RestApi.RestApiId}.execute-api.${AWS::Region}.amazonaws.com/${StageName}" },
      Export: {
        Name: `${projectName}-${environment}-ApiUrl`,
      },
    };

    resources.Outputs.RestApiId = {
      Description: "REST API ID",
      Value: { Ref: "RestApi" },
    };

  } else if (apiType === "http") {
    // HTTP API Gateway
    resources.Resources.HttpApi = {
      Type: "AWS::ApiGatewayV2::Api",
      Properties: {
        Name: `${projectName}-${environment}-http-api`,
        ProtocolType: "HTTP",
        Description: "HTTP API for " + projectName,
      },
    };

    // HTTP API Integration
    resources.Resources.HttpIntegration = {
      Type: "AWS::ApiGatewayV2::Integration",
      Properties: {
        ApiId: { Ref: "HttpApi" },
        IntegrationType: "HTTP_PROXY",
        IntegrationUri: { "Fn::Sub": "http://${LoadBalancer.DNSName}" },
        IntegrationMethod: "POST",
        ConnectionType: "INTERNET",
        RequestParameters: {
          "overwrite:header.X-Forwarded-For": "$context.sourceIp",
        },
      },
    };

    // HTTP API Route
    resources.Resources.HttpRoute = {
      Type: "AWS::ApiGatewayV2::Route",
      Properties: {
        ApiId: { Ref: "HttpApi" },
        RouteKey: "$default",
        Target: { "Fn::Sub": "integrations/${HttpIntegration.IntegrationId}" },
      },
    };

    // HTTP API Stage
    resources.Resources.HttpStage = {
      Type: "AWS::ApiGatewayV2::Stage",
      Properties: {
        ApiId: { Ref: "HttpApi" },
        Name: { Ref: "StageName" },
        AutoDeploy: true,
        ...(enableThrottling && {
          DefaultRouteSettings: {
            ThrottlingBurstLimit: cfg.throttle_burst_limit || 200,
            ThrottlingRateLimit: cfg.throttle_rate_limit || 100,
          },
        }),
      },
    };

    // Outputs
    resources.Outputs.HttpApiUrl = {
      Description: "HTTP API URL",
      Value: { "Fn::Sub": "https://${HttpApi.ApiId}.execute-api.${AWS::Region}.amazonaws.com/${StageName}" },
      Export: {
        Name: `${projectName}-${environment}-HttpApiUrl`,
      },
    };

    resources.Outputs.HttpApiId = {
      Description: "HTTP API ID",
      Value: { Ref: "HttpApi" },
    };
  }

  // WAF
  if (enableWaf) {
    resources.Resources.WebACL = {
      Type: "AWS::WAFv2::WebACL",
      Properties: {
        Name: `${projectName}-${environment}-waf`,
        Scope: "REGIONAL",
        DefaultAction: {
          Allow: {},
        },
        Rules: [
          {
            Name: "RateLimit",
            Priority: 1,
            Statement: {
              RateBasedStatement: {
                Limit: cfg.waf_rate_limit || 2000,
                AggregateKeyType: "IP",
              },
            },
            Action: {
              Block: {},
            },
            VisibilityConfig: {
              CloudWatchMetricsEnabled: true,
              MetricName: "RateLimit",
              SampledRequestsEnabled: true,
            },
          },
          {
            Name: "SqlInjection",
            Priority: 2,
            Statement: {
              SqliMatchStatement: {
                FieldToMatch: {
                  Body: {},
                },
                TextTransformations: [
                  {
                    Priority: 0,
                    Type: "URL_DECODE",
                  },
                ],
              },
            },
            Action: {
              Block: {},
            },
            VisibilityConfig: {
              CloudWatchMetricsEnabled: true,
              MetricName: "SqlInjection",
              SampledRequestsEnabled: true,
            },
          },
        ],
      },
    };

    // WAF Association
    resources.Resources.WebACLAssociation = {
      Type: "AWS::WAFv2::WebACLAssociation",
      Properties: {
        ResourceArn: apiType === "rest" 
          ? { "Fn::Sub": "arn:aws:apigateway:${AWS::Region}:${AWS::AccountId}:restapis/${RestApi.RestApiId}/stages/${StageName}" }
          : { "Fn::Sub": "arn:aws:apigateway:${AWS::Region}:${AWS::AccountId}:v2/apis/${HttpApi.ApiId}/stages/${StageName}" },
        WebACLArn: { Ref: "WebACL" },
      },
    };
  }

  // CloudWatch Monitoring
  if (cfg.enable_monitoring === true) {
    if (apiType === "rest") {
      resources.Resources.Api4xxErrorsAlarm = {
        Type: "AWS::CloudWatch::Alarm",
        Properties: {
          AlarmName: `${projectName}-${environment}-api-4xx`,
          AlarmDescription: "API has too many 4XX errors",
          MetricName: "4XXError",
          Namespace: "AWS/ApiGateway",
          Statistic: "Sum",
          Period: "300",
          EvaluationPeriods: "2",
          Threshold: "50",
          ComparisonOperator: "GreaterThanThreshold",
          AlarmActions: [{ Ref: "SNSTopic" }],
          Dimensions: [
            {
              Name: "ApiName",
              Value: { Ref: "RestApi" },
            },
          ],
        },
      };

      resources.Resources.Api5xxErrorsAlarm = {
        Type: "AWS::CloudWatch::Alarm",
        Properties: {
          AlarmName: `${projectName}-${environment}-api-5xx`,
          AlarmDescription: "API has too many 5XX errors",
          MetricName: "5XXError",
          Namespace: "AWS/ApiGateway",
          Statistic: "Sum",
          Period: "300",
          EvaluationPeriods: "2",
          Threshold: "10",
          ComparisonOperator: "GreaterThanThreshold",
          AlarmActions: [{ Ref: "SNSTopic" }],
          Dimensions: [
            {
              Name: "ApiName",
              Value: { Ref: "RestApi" },
            },
          ],
        },
      };

      resources.Resources.ApiLatencyAlarm = {
        Type: "AWS::CloudWatch::Alarm",
        Properties: {
          AlarmName: `${projectName}-${environment}-api-latency`,
          AlarmDescription: "API latency is too high",
          MetricName: "Latency",
          Namespace: "AWS/ApiGateway",
          Statistic: "Average",
          Period: "300",
          EvaluationPeriods: "2",
          Threshold: "10000", // 10 seconds
          ComparisonOperator: "GreaterThanThreshold",
          AlarmActions: [{ Ref: "SNSTopic" }],
          Dimensions: [
            {
              Name: "ApiName",
              Value: { Ref: "RestApi" },
            },
          ],
        },
      };

    } else {
      resources.Resources.HttpApi4xxErrorsAlarm = {
        Type: "AWS::CloudWatch::Alarm",
        Properties: {
          AlarmName: `${projectName}-${environment}-http-api-4xx`,
          AlarmDescription: "HTTP API has too many 4XX errors",
          MetricName: "4xxError",
          Namespace: "AWS/ApiGateway",
          Statistic: "Sum",
          Period: "300",
          EvaluationPeriods: "2",
          Threshold: "50",
          ComparisonOperator: "GreaterThanThreshold",
          AlarmActions: [{ Ref: "SNSTopic" }],
          Dimensions: [
            {
              Name: "ApiName",
              Value: { Ref: "HttpApi" },
            },
          ],
        },
      };

      resources.Resources.HttpApi5xxErrorsAlarm = {
        Type: "AWS::CloudWatch::Alarm",
        Properties: {
          AlarmName: `${projectName}-${environment}-http-api-5xx`,
          AlarmDescription: "HTTP API has too many 5XX errors",
          MetricName: "5xxError",
          Namespace: "AWS/ApiGateway",
          Statistic: "Sum",
          Period: "300",
          EvaluationPeriods: "2",
          Threshold: "10",
          ComparisonOperator: "GreaterThanThreshold",
          AlarmActions: [{ Ref: "SNSTopic" }],
          Dimensions: [
            {
              Name: "ApiName",
              Value: { Ref: "HttpApi" },
            },
          ],
        },
      };
    }
  }

  return {
    name: "api-gateway.yaml",
    path: `${projectName}/api-gateway.yaml`,
    content: JSON.stringify(resources, null, 2),
    language: "yaml",
  };
}
