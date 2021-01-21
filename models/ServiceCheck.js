import Model from '@/models/Model';

export default class ServiceCheck extends Model {
  static className = 'ServiceCheck';
  static filters = {
    ...this.defaultFilters,
  };
  static attributes = {
    checkInterval: 90,
    protocol: 'tcp',
    service: 'http',
    active: true,
  };

  static customPortAttributes = {
    ...ServiceCheck.attributes,
    service: 'tcp',
  };

  static httpPortAttributes = {
    ...ServiceCheck.attributes,
    port: 80,
  };

  static ICMPAttributes = {
    ...ServiceCheck.attributes,
    protocol: 'icmp',
    service: 'ping',
  };

  static SSLCertificateCheckAttributes = {
    ...ServiceCheck.attributes,
    checkInterval: 3600,
    protocol: 'ssl',
    service: 'https',
    port: 443,
  };

  get isPreflighting() {
    return !! this.preflight;
  }

  get isIcmpCheck() {
    return this.protocol.toUpperCase() === 'ICMP';
  }

  get isSslCheck() {
    return this.protocol.toUpperCase() === 'SSL';
  }

  static newCustomPortCheck() {
    return new ServiceCheck({
      ...ServiceCheck.customPortAttributes
    });
  }

  static newHttpPortCheck() {
    return new ServiceCheck({
      ...ServiceCheck.httpPortAttributes
    });
  }

  static newICMPCheck() {
    return new ServiceCheck({
      ...ServiceCheck.ICMPAttributes
    });
  }

  static newSSLCertificateCheck() {
    return new ServiceCheck({
      ...ServiceCheck.SSLCertificateCheckAttributes
    });
  }
}
