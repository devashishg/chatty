export interface SignatureOptions {
	issuer: string;
	audience: string;
	expiresIn?: string;
	algorithm: string;
}