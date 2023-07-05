let http = require('http');
let mysql = require('mysql');
let formidable = require("formidable");
let async  = require("async");
let conDetails = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"twitter_db"
});
let crypto = require("crypto-js");

const enc = (data,key)=>{
    let encData = crypto.AES.encrypt(data,key).toString();
    return encData;
}

const dec =(encData,key)=>{
    let decData = crypto.AES.decrypt(encData,key);
    return decData.toString(crypto.enc.Utf8);
}
const test = async ()=>{
    console.log("test");
}

http.createServer((req,res)=>{
    res.setHeader('Access-Control-Allow-Origin','*'); //set header config
    if(req.url == "/register"){
        let form = new formidable.IncomingForm();
        form.parse(req,(err,fields,files)=>{
            let uname = fields.uname;
            let email = fields.email;
            let pass = fields.pass;
            let bio = fields.bio;
            let encPass = enc(JSON.stringify(pass),"hotdog");
            conDetails.connect((err)=>{
                let insertSql = `INSERT INTO user_tb (uname,password,email,bio,header_img,profile_img) VALUE ('${uname}','${encPass}','${email}','${bio}','dammyHeaderImg','dammyProfileImg')`;
                conDetails.query(insertSql,(err,result)=>{
                    if(err) throw err;
                })
            })
            res.writeHead(200,"All good");
            res.write("Your information has been added successfully");
            res.end();
        })
    }else if(req.url == "/login"){
        let tmpRes = "";
        let decPass;
        let form = new formidable.IncomingForm();
        form.parse(req,(err,fields,files)=>{
            let email = fields.email;
            let pass = fields.pass;
            conDetails.connect((err)=>{
                // let selectSql = `SELECT * FROM user_tb`;
                let selectSql = `SELECT * FROM user_tb WHERE email='${email}'`;
                conDetails.query(selectSql,(err,result)=>{  
                    if(err) throw err;
                    console.log(result);
                    decPass = dec(result[0].password,"hotdog");
                    console.log(decPass);
                })
            })
        })
    }
}).listen(3001);
