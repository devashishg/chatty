import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { userModel } from '../entity/user/user.model';

dotenv.config();

const URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB}`;
mongoose.connect(URI, { useCreateIndex: true,useUnifiedTopology: true, useNewUrlParser: true, w: 'majority' }).catch(err => {
    console.log('Error Encountered');
});
const db = mongoose.connection;
db.once('open', () => console.log('connected to the database'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = {
    db,
    mongoose,
    User: userModel,
};
