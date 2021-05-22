import * as express from 'express';
import * as bcrypt from 'bcryptjs';
import { UserService } from './user.service';
import { TokenService } from '../../utils/jwt';


class UserController extends TokenService {
	router = express.Router();

	constructor() {
		super();
		this.router.post('/register',this.saveUser.bind(this));
		this.router.post('/verify',this.verifyUser.bind(this));
		this.router.post('/getotp',this.getOTP.bind(this));
		this.router.post('/Auth',this.Authentication.bind(this));
		
		this.router.post('/friendsList',this.AuthorizeUser,this.friendList.bind(this));
		this.router.put('/addConnection/:username',this.AuthorizeUser,this.addConnection.bind(this));
		this.router.put('/removeConnection/:username',this.AuthorizeUser,this.removeConnection.bind(this));
	}

	throwErrorMethod (res, err) {
		try {
			let errorToHandle = JSON.parse(err.message);
			res.status(errorToHandle.code).json({message:errorToHandle.message})
		} catch (error) {
			res.status(403).json({message:err.message});
		}
	}

	//register user
	saveUser(req,res,next){
		let key = req.body.key;
		let user = {...req.body};
		user['token'] = Math.random().toString(36).slice(7);
		user['key'] = bcrypt.hashSync(key,10);
		UserService.saveUser(user).then(
			data=>{
				//TODO: send a mail with token to verify user
				res.status(201).json({data:{id:data._id,handle:data.handle},message:'user registered successfully. A verification email is sent, Please login and verify the email.'});
			}
			).catch(err=>{
				if(err.code === 11000){
					res.status(406).json({data:err.keyValue,message:'Already taken'});
				}else{
					this.throwErrorMethod(res,err);
				}
		});
	};

	//Email verification
	verifyUser(req,res,next){
		let verification = {...req.body};
		
		UserService.verifyUser(verification.handle,verification.token).then(data=>{
			res.status(202).json({message:'User verified'});
		}).catch(
			err=>{
				this.throwErrorMethod(res,err);
			}
		);        
	};
	
	//get OTP again
	getOTP(req,res,next){
		let user = {...req.body};    
		UserService.sentOTPMail(user.handle).then(data=>{
			res.status(201).json({message:'OTP dispatched, Please check you inbox.'});
		}).catch(err=>{
				this.throwErrorMethod(res,err);
			}
		);        
	};
	
	//Login set token in cookies
	Authentication(req,res,next){
		let loginData = {...req.body};
		let _data:any = {username:loginData.username,password:loginData.password};
	
		UserService.authenticate(_data).then(data=>{
			res.cookie('token',_data.token , { httpOnly: true, secure:true});
			res.status(202).json({data: _data.user,message:'Logged-in successfully!'});
		}).catch(err=>{
			this.throwErrorMethod(res,err);
		})
	}
	
	//Get friend list
	friendList(req,res,next){
		const userId = req._id;
		UserService.getFriendList(userId).then(_data=>{
			res.status(200).json({data:_data});
		}).catch(err=>{
			this.throwErrorMethod(res,err);
		});
	}
	
	//Adds connection
	addConnection(req,res,next){
		const userId = req._id;
		const connectionName = req.params.username;
		UserService.addConnection(userId,connectionName).then((val)=>{
			res.status(200).json({message:'Connection Added!'});
		},err=>{
			this.throwErrorMethod(res,err);
		}).catch(err=>{
			this.throwErrorMethod(res,err);
		});
	}
	
	// Removes connection
	removeConnection(req,res,next){
		const handle = req._id;
		const connectionName = req.params.username;
		UserService.removeConnection(handle,connectionName).then((val)=>{
			res.status(200).json({message:'Connection Updated!'});
		},err=>{
			this.throwErrorMethod(res,err);
		}).catch(err=>{
			this.throwErrorMethod(res,err);
		});
	}
}


export const router = new UserController().router;