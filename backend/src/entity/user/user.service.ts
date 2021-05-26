import { sign } from 'jsonwebtoken';
import { join } from 'path';
import { readFileSync } from 'fs';
import { compareSync } from 'bcryptjs';
import { SignatureOptions } from '../../utils/Models';
import { userModel as User } from '../../entity/user/user.model';
import { db } from '../../utils/db.connection';

const prKeyPath = join(__dirname, '../../..', 'certificates', 'private.pem');
const privateKey = readFileSync(prKeyPath, { encoding: 'utf-8' });

const signOptions: SignatureOptions = {
	issuer: 'Team Chatty',
	audience: 'user',
	expiresIn: '10d',
	algorithm: 'RS256'   // RSASSA [ "RS256", "RS384", "RS512" ]
};

export class UserService {
	static users:any = User;

	public static async saveUser(user) {
    if(db.readyState===1) {
      return await this.users.create(user);
    } else {
      throw Error(JSON.stringify({ message: 'Internal server error', code: 501 }))
    }
	}

	public static async authenticate(data) {
		try {
			const user = await this.users.findOne({ email: data.email });
			if (user) {
					if (!compareSync(data.key, user.key)) {
						throw Error(JSON.stringify({ message: 'Invalid credentials, please try again!', code: 401 }))
					} else {
						const jwtKey = sign({ user: user.name }, { key: privateKey, passphrase: process.env.PASSPHRASE }, { ...signOptions });
						user.token = jwtKey;
            return user;
					}
			} else {
				throw Error(JSON.stringify({ message: 'User not exist!', code: 404 }));
			}
		} catch (error) {
			throw error;
		}
	}

	static getConnectionSchemaObject(userToAdd, following) {
		return {
			name: userToAdd.name,
			user: userToAdd._id,
			handle: userToAdd.handle,
			following: following,
			follower: !following,
		}
	}
}
