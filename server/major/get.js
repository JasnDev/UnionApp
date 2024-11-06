import registro from "../connection/connection1.js";
async function GetAll(req,res){

try {
    const Find=await registro.find()
    res.send(Find)
} catch (error) {
    console.log(error)
}

}
export default GetAll