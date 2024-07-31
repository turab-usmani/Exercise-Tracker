const express = require('express')
let mongoose = require('mongoose');
const app = express()
const cors = require('cors')
require('dotenv').config()
const {Schema } = mongoose;



mongoose.connect("mongodb+srv://turabofficial2003:helloworld@cluster.7ad5bvt.mongodb.net/")


const userSchema = new Schema ({

  username : String

});

const exerciseSchema = new Schema ({


  user_id : {type : String, required : true},
  description : String,
  duration : Number,
  date : Date


});

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema)



app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({extended:true})) //this is to access html objects.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.get('/api/users', async (req, res) => {

  const users = await User.find({}).select("_id username");
  if (!users) {

    res.send("No users");

  } else {

    res.json(users);
  }

})

app.post('/api/users', async (req, res) => {

    const userObj = new User( {

      username : req.body.username

    })


    try {

      const user =await userObj.save();
      res.json(user);
    } catch (err) {

      console.log(err);

    }
    



})


app.post("/api/users/:_id/exercises", async (req, res) => {

  const id = req.params._id;
  const {description, duration, date} = req.body;
  
  try {

    const user = await User.findById(id);

    if (!user) {

      res.send("Could not find user");

    } else {

      const exerciseObj = new Exercise ({

        user_id: user._id,
        description,
        duration,
        date: date? new Date(date) : new Date()




      })

      const exercise = await exerciseObj.save()
      res.json({

        _id : user._id,
        username : user.username,
        description : exercise.description,
        duration : exercise.duration,
        date :  new Date(exercise.date).toDateString()
      })


    }

  } catch(err) {  

    console.log(err);
    res.send("There was an error saving the exercise")

  }

})


app.get('/api/users/:_id/logs', async (req, res) => {

  const {from, to, limit} = req.query;
  const id = req.params._id;
  const user = await  User.findById(id);

  if (!user) {
    res.send("Could not find user");
    return;
  }


  let dateObj = {}
  if (from) {

    dateObj["$gte"] = new Date(from);


  }

  if (to) {

    dateObj["$lte"] = new Date(to);

  }

  let filter = {user_id : id};

  if (from || to ) {

    filter.date = dateObj;
  }

  const exercises = await Exercise.find(filter).limit(+limit ?? 500)

  const log = exercises.map(e => ({

    description : e.description,
    duration :  e.duration,
    date : e.date.toDateString()



  }))

  res.json({

    username : user.username,
    count : exercises.length,
    _id : user._id,
    log 

  })


})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
