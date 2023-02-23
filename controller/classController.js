const e = require("express");
const { default: mongoose } = require("mongoose");

require("../model/classModel");
const ClassShcema = mongoose.model("class");
const TeacherShcema = mongoose.model("teacher");
const ChildShcema = mongoose.model("child");

exports.getAllClass = (req,res,next)=>{
    ClassShcema.find()
    .populate({path:"supervisor",select:{fullname:1}})
    .populate({path:"children",select:{fullName:1}})
    .then(data=> res.status(200).json({data}))
    .catch(error=>next(error))
}
exports.getClassById = (req,res,next)=>{
    ClassShcema.findById(req.params._id)
    .populate({path:"supervisor",select:{fullname:1}})
    .populate({path:"children",select:{fullName:1}})
    .then(data=> res.status(200).json({data}))
    .catch(error=>next(error));
}
exports.addClass = async (req,res,next)=>{
    try{
        // check if supervisor exist 
        const supervisor = await TeacherShcema.findOne({_id:req.body.supervisor},{_id:1});
        if(supervisor==null)
            throw new Error("supervisor not found");
            //children request array
            const requestArray = req.body.children;
            let existing = await ChildShcema.find({_id: {$in:requestArray}},{_id:1})
            let notFoundArray=  requestArray.filter(element=>{
                if (!existing.find(e => e._id === element)) 
                return element
              }) 
              if(notFoundArray.length >0)
                    throw Error(notFoundArray + " children ids not found")
              await new ClassShcema({
                _id:req.body._id,
                name:req.body.name,
                supervisor:req.body.supervisor,
                children:req.body.children,
            }).save()
            
            res.status(201).json({data:"added"});
    }
    catch(error){
        next(error);
    }
}
exports.updateClass = (req,res,next)=>{
    ClassShcema.updateOne(
        {
            _id:req.params._id
        },
        {
            $set:{
                name:req.body.name,
                supervisor:req.body.supervisor,
                children:req.body.children,
        }
    })
    .then(data =>{
        if(data.modifiedCount == 0){
            throw new Error("not found this class")
        }
        res.status(200).json({data});
    })
    .catch(error=>next(error))
}
exports.deleteClass = (req,res,next)=>{
    ClassShcema.deleteOne({_id:req.params._id})
    .then(data=>{
        if(data.deletedCount > 0)
            res.status(200).json({data})
        else
            throw new Error("can't delete not exist class ")
    })
    .catch(error=>next(error))
}
    //get class children
exports.getClassChildren = (req,res,next)=>{
    ClassShcema.find({_id:req.params._id},{children:1})
    .populate({path:"children",select:{fullName:1}})
    .then( data=>{
        res.status(200).json({data})
        if(data == null) throw new Error("this class not exist");
    })
    .catch(error=>next(error))
   
}
    // get class supervisor
exports.getClassSupervisor = (req,res,next)=>{
    ClassShcema.findOne({_id:req.params._id},{supervisor:1})
    .populate({path:"supervisor",select:{fullname:1}})
    .then(data=>{
        if(data == null) throw new Error("this class not exist");
        else res.status(200).json({data});
    })
    .catch(error=>next(error))
}