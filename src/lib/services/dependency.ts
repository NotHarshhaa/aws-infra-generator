import {
  getServiceDependencies,
  resolveServicesInOrder,
} from "../service-dependencies";

export class DependencyResolver {
  resolve(services: string[]): string[] {
    return resolveServicesInOrder(services);
  }

  getDependencies(serviceId: string): string[] {
    return getServiceDependencies(serviceId);
  }
}

export { getServiceDependencies, resolveServicesInOrder } from "../service-dependencies";
