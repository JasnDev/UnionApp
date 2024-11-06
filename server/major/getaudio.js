import  audio  from "../connection/connection2.js";
async function getall(req,res){

try {
    const Find=await audio.find()
    res.send(Find)
} catch (error) {
    console.log(error)
}

}
export default getall