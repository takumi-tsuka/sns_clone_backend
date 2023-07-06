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
let Cryptojs = require("crypto-js");

const enc = (data,key)=>{
    let encData = Cryptojs.AES.encrypt(data,key).toString();
    return encData;
}

const dec =(encData,key)=>{
    let decData = Cryptojs.AES.decrypt(encData,key);
    return decData.toString(Cryptojs.enc.Utf8);
}
// const test = async ()=>{
//     console.log("test");
// }

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
        let decPass;
        let form = new formidable.IncomingForm();
        form.parse(req,(err,fields,files)=>{
            let email = fields.email;
            let pass = fields.pass;
            conDetails.connect((err)=>{
                // if(err) throw err;
                let selectSql = `SELECT * FROM user_tb WHERE email='${email}'`;
                conDetails.query(selectSql,(err,result)=>{  
                    // if(err) throw err;
                    if(result != ""){
                        decPass = dec(result[0].password,"hotdog");
                        if(JSON.parse(decPass)[0] == pass[0]){
                            res.writeHead(200,"Varified");
                            res.write(JSON.stringify(result));
                            res.end();
                        }else{
                            res.writeHead(401,"Unauthorized");
                            res.end();
                        }
                    }else{
                        console.log("user isn't found");
                        res.writeHead(200,"Unauthorized");
                        res.write("Unauthorized");
                        res.end();
                    }
                })
            })
        })
    }
}).listen(3001);
