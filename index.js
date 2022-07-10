
const express = require('express');
const ejs = require("ejs")
const fs = require('fs');

const pdf  = require("html-pdf")
let path = require("path");

const { default: mongoose } = require('mongoose');

mongoose.connect("mongodb://localhost:27017/QpgDB" , { useNewUrlParser : true});


const app = express();

//allows you to access the data information from html pages:
//using req.body
const bodyParser = require('body-parser');
const { create } = require('domain');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded

 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

let exam_name = "";
let branch = "";
let sem = "";
let sub = "";
let subcode = "";

let inst = "";
let fac = "";
let time = "";
let date ;

let maxm ;

let count = 1;

let Qd = "";


const quesSchema = new mongoose.Schema ({
    Level_of_exam : String,
    Branch : String,
    Semester : String,
    Subject : String,
    SubjectCode : String,
    Date : String,
    Duration : String,
    MaxMarks : Number
})



const quesRec = new mongoose.Schema ({
    Qid : Number,
    Qtype : String,
    Qtext : String,
    Qmarks : Number,
    QDiff : String,
    Qunit : Number
})

let id ;

const QuesRec = mongoose.model("QuesRec" , quesRec);

const Ques = mongoose.model("Ques" , quesSchema)

app.get("/" , function(req , res){
 //   res.send("hello");
    res.render("login");
})

app.post("/login" , function(req , res){
    res.render("create")
})
app.post("/create" , function(req, res){

    exam_name = req.body.exam;
    branch = req.body.branch;
    sem = req.body.sem;
    sub = req.body.sub;
    subcode = req.body.subc;
    inst = req.body.inst;
    fac = req.body.fac;
    time = req.body.time;
    date = req.body.date;
    maxm = req.body.marks;



    count = 1;

    res.redirect("/genrate");
})

app.get("/genrate" , function(req , res){
    res.render("genrate" ,{Qcount : count});
})



app.post("/add" , function(req , res){
    //console.log(req.body);
     
    let type = req.body.QuesType;

    if(type === 'ILLUSTRATE')
    {
        Qd = 'CO3' 
    }
    else if(type === 'EXPLAIN WITH DIAGRAM')
    {
        Qd = 'CO4'
    }
    else if(type === 'TRUE-FALSE')
    {
        Qd = 'CO1'
    }
    else if(type === 'DEFINE')
    {
        Qd = 'CO3'
    }
    else if(type === 'FILL IN THE BLANKS')
    {
        Qd = 'CO2'
    }
    else if(type === 'MCQ')
    {
        Qd = 'CO2'
    }

    const Qrec = new QuesRec ({
    Qid : count,
    Qtype : req.body.QuesType,
    Qtext : req.body.Question,
    Qmarks : req.body.QuesMarks,
    QDiff : Qd,
    Qunit : req.body.QuesUnit
    })

   

    Qrec.save();

     count++;
    res.redirect("/genrate");
})


app.post("/next" , function(req , res){
    res.redirect("preview");

})



// preview page get request

app.get("/preview" , function(req , res){

  //  console.log(count);
let qid = [];
let qtype =[];
let qtext =[];
let qmarks =[];
let qdiff =[];
let qunit =[];

    count = 0;
    QuesRec.find(function(err , qr){
        if(err){
            console.log(err)
        }
        else
        {
            qr.forEach(function(qre){
                console.log(typeof qre.Qtype);
                qid.push(parseInt(qre.Qid));
                qmarks.push(String(qre.Qmarks));
                qtext.push(String(qre.Qtext));
                qtype.push(String(qre.Qtype));
                qdiff.push(String(qre.QDiff));
                qunit.push(parseInt(qre.Qunit));
                count++;
            })
            res.render("preview" , {count : count , qid : qid , qtext : qtext , qmarks : qmarks , qdiff : qdiff});
        }

    })

    //console.log(qid[1]);
   
    
})

app.post("/upd" , function(req , res){

    let num = req.body.num;
    QuesRec.find({Qid : num} , function(err ,qr)
    {
        if(err)
        {
            console.log(err);
        }else{
            qr.forEach(function(qre){
                id = qre.Qid; 
            })
            res.render("update",{Qcount : num});
        }

    })
   
})

app.post("/update" , function(req , res) {

    let type = req.body.QuesType;

    if(type === 'ILLUSTRATE')
    {
        Qd = 'CO3' 
    }
    else if(type === 'EXPLAIN WITH DIAGRAM')
    {
        Qd = 'CO4'
    }
    else if(type === 'TRUE-FALSE')
    {
        Qd = 'CO1'
    }
    else if(type === 'DEFINE')
    {
        Qd = 'CO3'
    }
    else if(type === 'FILL IN THE BLANKS')
    {
        Qd = 'CO2'
    }
    else if(type === 'MCQ')
    {
        Qd = 'CO2'
    }
    
    QuesRec.findOneAndUpdate({Qid : id} , {
        Qtype : req.body.QuesType,
        Qtext : req.body.Question,
        Qmarks : req.body.QuesMarks,
        QDiff : Qd,
        Qunit : req.body.QuesUnit
    } , function(err){
if(err)
{
    console.log(err);
}else{
    console.log("updated");
    res.redirect("/preview");
}
    })

})

app.post("/del" , function(req , res){

    let num = req.body.num;

    QuesRec.deleteOne({Qid : num} , function(err){
        if(err)
        {
            console.log(err);
        }
        else {
            console.log("Succesfully deleted");
        }
    })

    QuesRec.find(function(err , qr){
        if(err){
            console.log(err)
        }
        else
        {
            qr.forEach(function(qre){
                if(parseInt(qre.Qid) > num)
                {
                    QuesRec.updateOne({Qunit : qre.Qunit} , {Qid : num} , function(err){
                        if(err)
                        {
                            console.log(err);
                        }
                        else {
                            console.log("Succesful")
                        }
                    })
                    num++;
                }
            })
        }
    })

    res.redirect("/preview");
});

app.get("/generateReport", (req, res) => {
    
    let qid = [];
    let qtype =[];
    let qtext =[];
    let qmarks =[];
    let qdiff =[];
    let qunit =[];
    let s = [];
    var data = {};
        count = 0;
        QuesRec.find(function(err , qr){
            if(err){
                console.log(err)
            }
            else
            {
                qr.forEach(function(qre){
                    console.log(typeof qre.Qtype);
                    qid.push(parseInt(qre.Qid));
                    qmarks.push(String(qre.Qmarks));
                    qtext.push(String(qre.Qtext));
                    qtype.push(String(qre.Qtype));
                    qdiff.push(String(qre.QDiff));
                    qunit.push(parseInt(qre.Qunit));
                    if(!s.includes(qre.Qunit))
                    s.push(qre.Qunit);
                })
    
                 data = {
                    s : s,
                   collegeName : "NITTE MEENAKSHI Institute of Technology",
                   exam_name : exam_name, 
                   branch : branch ,
                   sem :  sem ,
                    sub : sub,
                    subcode : subcode,
                    inst : inst,
                    fac : fac,
                    time : time,
                    date : date,
                    maxm : maxm,
                    count : 5 , qid : qid , qtext : qtext , qmarks : qmarks , qdiff : qdiff,
                    qunit : qunit
            
                };  

                gethtmltopdf();
               
            }
    
        })
    

    const gethtmltopdf = async () => {
        try {

  
    res.render("template" , data);
            
            const filePathName = path.resolve(__dirname, 'views/template.ejs');
            const htmlString = fs.readFileSync(filePathName).toString();
            let  options = { format: 'Letter' };
            const ejsData = ejs.render(htmlString, data);
            return await pdf.create(ejsData, options).toFile('generatedfile.pdf',(err, response) => {
                if (err) return console.log(err);
                return response;
            });
           
        } catch (err) {
            console.log("Error processing request: " + err);
        }
    
    
    }
    
})



app.listen(3000 , function(){
    console.log("Server started on port  : 3000");
});

