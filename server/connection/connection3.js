import  mongoose from './connection1.js';


const registro =  mongoose.connection.model("registro",{
  nome:{type:String},
  email:{type:String},
  senha:{type:String}
});

export default registro