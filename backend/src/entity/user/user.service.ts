import { sign } from 'jsonwebtoken';
import { join } from 'path';
import { readFileSync } from 'fs';
import { compareSync } from 'bcryptjs';
import { SignatureOptions } from '../../utils/Models';
const db = require('../../utils/DB.connection');

const prKeyPath = join(__dirname, '../../..', 'certificates', 'private.pem');
const privateKey = readFileSync(prKeyPath, { encoding: 'utf-8' });

const signOptions: SignatureOptions = {
	issuer: 'Team Let\'s Learn',
	audience: 'user',
	expiresIn: '10d',
	algorithm: 'RS256'   // RSASSA [ "RS256", "RS384", "RS512" ]
};

export class UserService {
	static users = db.User;

	public static async saveUser(user) {
		return await this.users.create(user);
	}

	public static async verifyUser(handle, token) {
		const user = await this.users.findOne({ handle: handle });
		if (user) {
			if (user.token !== token && !user.verified) {
				throw Error(JSON.stringify({ message: 'Invalid otp, please try again', code: 401 }))
			} else {
				user.token = "";
				user.verified = true;
				user.save();
			}
		} else {
			throw Error(JSON.stringify({ message: 'User not found', code: 404 }));
		}
	}

	public static async sentOTPMail(handle) {
		const user = await this.users.findOne({ handle: handle });
		const token = Math.random().toString(36).slice(7);
		if (user) {
			user.token = token;
			user.save();
			//TODO: send mail for OTP
		} else {
			throw Error(JSON.stringify({ message: 'User not found', code: 404 }));
		}
	}

	public static async authenticate(data) {
		try {
			const user = await this.users.findOne({ $or: [{ handle: data.username }, { email: data.username }] },{mates:0, savedFeeds:0});
			if (user) {
				if (user.verified) {
					if (!compareSync(data.password, user.key)) {
						throw Error(JSON.stringify({ message: 'Invalid credentials, please try again!', code: 401 }))
					} else {
						const jwtKey = sign({ user: user.handle }, { key: privateKey, passphrase: process.env.PASSPHRASE }, { ...signOptions });
						data.token = jwtKey;
						data.user = { ...user._doc };
						delete data.user.key;
						delete data.user.token;
						user.token = jwtKey;
					}
				} else {
					throw Error(JSON.stringify({ message: 'User not verified', code: 401 }));
				}
			} else {
				throw Error(JSON.stringify({ message: 'User not exist!', code: 404 }));
			}
		} catch (error) {
			throw error;
		}
	}

	public static async getFriendList(userHandle) {
		try {
			const user = await this.users.findOne({ handle: userHandle });
			if (user) {
				return [...user.mates];
			} else {
				throw Error(JSON.stringify({ message: 'User not exist!', code: 401 }));
			}
		} catch (error) {
			throw error;
		}
	}

	public static async addConnection(userHandle, requestUserHandle) {
		try {
			if (userHandle === requestUserHandle) {
				throw Error(JSON.stringify({ message: 'Invalid request', code: 406 }));
			}
			const userA = await this.users.findOne({ handle: userHandle, verified: true });
			const requestedUserB = await this.users.findOne({ handle: requestUserHandle, verified: true });

			if (userA && requestedUserB) {
				// To check if user has already any connection with requested user.
				const userAPosition = userA.mates.findIndex(mate => mate.handle === requestUserHandle)
				const userBPosition = requestedUserB.mates.findIndex(mate => mate.handle === userHandle);

				if (userAPosition === -1 && userBPosition === -1) {
					const entryOfA = this.getConnectionSchemaObject(userA, true)
					const entryOfB = this.getConnectionSchemaObject(requestedUserB, false)
					userA.mates.push(entryOfB)
					requestedUserB.mates.push(entryOfA)
				} else if (userA.mates[userAPosition].following && requestedUserB.mates[userBPosition].follower) {
					throw Error(JSON.stringify({ message: 'you are already following the user', code: 406 }));
				} else {
					userA.mates[userAPosition].following = true;
					requestedUserB.mates[userBPosition].follower = true;
				}
				await userA.save();
				await requestedUserB.save();
			} else {
				throw Error(JSON.stringify({ message: 'User not available or something went wrong, Please try again later', code: 500 }));
			}

		} catch (error) {
			throw error;
		}
	}

	public static async removeConnection(userHandle, requestUserHandle) {
		try {
			if (userHandle === requestUserHandle) {
				throw Error(JSON.stringify({ message: 'Invalid request', code: 406 }));
			}
			const userA = await this.users.findOne({ handle: userHandle, verified: true });
			const requestedUserB = await this.users.findOne({ handle: requestUserHandle, verified: true });

			if (userA && requestedUserB) {
				const userAPosition = userA.mates.findIndex(mate => mate.handle === requestUserHandle)
				const userBPosition = requestedUserB.mates.findIndex(mate => mate.handle === userHandle);

				if ((userAPosition === -1 && userBPosition === -1) ||
					(!userA.mates[userAPosition].following && !requestedUserB.mates[userBPosition].follower)) {
						throw Error(JSON.stringify({ message: 'Invalid request, you are not following the user', code: 400 }));
					} else {
						userA.mates[userAPosition].following = false;
						requestedUserB.mates[userBPosition].follower = false;
						if (!userA.mates[userAPosition].follower && !requestedUserB.mates[userBPosition].following) {
							userA.mates.splice(userAPosition,1);
							requestedUserB.mates.splice(userBPosition,1);
						}
					}
				await userA.save();
				await requestedUserB.save();
			} else {
				throw Error(JSON.stringify({ message: 'User not available or something went wrong, Please try again later', code: 500 }));
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
