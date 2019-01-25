import { CAInfo } from "../../types";
import { Certificate } from "../../entity";
import { NginxConfig } from "../../utils/nginx-config-parser";

/** 获取证书信息 */
export interface GetCAInfoFunc {
  (): Promise<CAInfo>
}

/** 创建证书 */
export interface CreateCACertificateFunc {
  (certificate: Certificate): Promise<Certificate>
}

export interface InjectNginxConfigFunc {
  (config: NginxConfig, certificate: Certificate): Promise<void>
}
