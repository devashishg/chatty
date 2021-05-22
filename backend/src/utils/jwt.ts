import { verify, decode } from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";
import { SignatureOptions } from "./Models";

const puKeyPath = path.join(__dirname, "../..", "certificates", "public.pem");
const publicKey = fs.readFileSync(puKeyPath, { encoding: "utf-8" });

const signOptions: SignatureOptions = {
	issuer: "Team Let's Learn",
	audience: "user",
	algorithm: "RS256", // RSASSA [ "RS256", "RS384", "RS512" ]
};

export class TokenService {
	constructor() { }
	AuthorizeUser(req, res, next) {
		let cookie = req.cookies.token;
		try {
			if (verify(cookie, publicKey, signOptions)) {				
				req._id = decode(cookie).user;
				next();
			}
		} catch (error) {
			res.status(401).json({
				message: "Unauthorized Access, Please try login again!",
				err: error.message,
			});
		}
	}
}
