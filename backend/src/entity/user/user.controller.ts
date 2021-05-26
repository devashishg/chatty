import * as express from 'express';
import * as bcrypt from 'bcryptjs';
import { UserService } from './user.service';
import { TokenService } from '../../utils/jwt';


class UserController extends TokenService {
	router = express.Router();

	constructor() {
		super();
		this.router.post('/register',this.saveUser.bind(this));
		this.router.post('/Auth',this.Authentication.bind(this));
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
		user['key'] = bcrypt.hashSync(key,10);
		UserService.saveUser(user).then(
			data=>{
				//TODO: send a mail with token to verify user
				res.status(201).json({data:{id:data._id},message:'user registered successfully. A verification email is sent, Please login and verify the email.'});
			}
			).catch(err=>{
				if(err.code === 11000){
					res.status(406).json({data:err.keyValue,message:'Already taken'});
				}else{
					this.throwErrorMethod(res,err);
				}
		});
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


}


export const router = new UserController().router;
