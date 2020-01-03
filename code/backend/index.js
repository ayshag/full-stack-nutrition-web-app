var express = require('express')
var app = express();
var cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors({ origin: '*', credentials: true }));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

var database = require('./database');


app.post('/signup',function (req, res){
  
  database.getConnection(function(error, connection){
    if(error)
      {
        console.log(error);
        return;

      }
      
      var sql = "INSERT INTO LOGIN VALUES(0,'" +req.body.name+ "', '" + req.body.email + "', '"+ req.body.password +"', true)";
      const data = {
        'authenticated' : ''
      }
    
      connection.query(sql, function (error, response) {
      if (error) 
      {
          if(error.code == 'ER_DUP_ENTRY')
          {
              data.authenticated = 'emailError';
          }
          else
            console.log(error);
      }
      else
      {
        data.authenticated = 'true';
        var sql2 = "INSERT INTO USERS VALUES(0,'" +req.body.question1+ "', '" + req.body.answer1 + "', '"+ req.body.question2 +"', '" + req.body.answer2+ "',0, '" + req.body.email +"')";
        connection.query(sql2, function (error, response) {
          if (error) 
          {
              console.log(error);
          }
        })
      }
      connection.release();    
      res.end(JSON.stringify(data));
      });
    }
  )
  
});



app.post('/signin',function (req, res){
  database.getConnection(function(error, connection){
    if(error)
      {
        console.log(error);
        return;
      }
      var sql = "SELECT EMAIL, PWD FROM LOGIN WHERE EMAIL = '" +req.body.email+ "' AND PWD = '" + req.body.password + "'";
      connection.query(sql, function (error, response) {
        if (error) 
          console.log(error);
          
      const data = {
        'authenticated' : false
      }

      if(response.length == 1)
        data.authenticated = true;
      connection.release();
      res.end(JSON.stringify(data));
      
      });
    }
  )
  
});




app.post('/search',function (req, res){
  database.getConnection(function(error, connection){
    if(error)
      {
        console.log(error);
        return;
      }
      var sql = "SELECT * FROM FOODS WHERE `FOOD NAME` LIKE '%"+ req.body.search+ "%'";
      connection.query(sql, function (error, response) {
        if (error) 
          console.log(error);
      connection.release();
      res.end(JSON.stringify(response));
      });
    }
  )
  
});

app.post('/getpreferences',function (req, res){
  database.getConnection(function(error, connection){
        if(error)
        {
          console.log(error);
          return;
        }
        var sql = "SELECT login.email, users_diet_preferences.id, nutrition_name, nutrition_value FROM login, users_diet_preferences\n" +
            "\tWHERE login.id=users_diet_preferences.users_id AND login.email='" + req.body.email + "'";
       // var sql = "SELECT * FROM FOODS WHERE `FOOD NAME` LIKE '%"+ req.body.search+ "%'";
       connection.query(sql, function (error, response) {
          if (error)
            console.log(error);
            connection.release();
          res.end(JSON.stringify(response));
        });
      }
  )

});
app.post('/savepreferences',function (req, res){

  database.getConnection(function(error, connection){
        if(error)
        {
          console.log(error);
          return;
        }
        var id = null;
        var sql =  "SELECT ID FROM LOGIN WHERE EMAIL = '" + req.body.user + "'";
        connection.query(sql, function (error, response) {
          if (error)
            console.log(error);    
        id = response[0].ID;
        var sql = "DELETE FROM users_diet_preferences WHERE users_id="+id;
          connection.query(sql, function (error, response) {
            if (error)
              console.log(error);

            //Water
            var sql = "INSERT INTO users_diet_preferences VALUES(0," + id + ", 'water'," + req.body.water + ")";
            connection.query(sql, function (error, response) {
              //Protein
              sql = "INSERT INTO users_diet_preferences VALUES(0," + id + ", 'protein'," + req.body.protein + ")";
              connection.query(sql, function (error, response) {
                //Fat
                sql = "INSERT INTO users_diet_preferences VALUES(0," + id + ", 'fat'," + req.body.fat + ")";
                connection.query(sql, function (error, response) {
                  //Carbohydrates
                  sql = "INSERT INTO users_diet_preferences VALUES(0," + id + ", 'carbohydrate'," + req.body.water + ")";
                  connection.query(sql, function (error, response) {
                    //Energy
                    sql = "INSERT INTO users_diet_preferences VALUES(0," + id + ", 'energy'," + req.body.calories + ")";
                    connection.query(sql, function (error, response) {
                      //Starch
                      sql = "INSERT INTO users_diet_preferences VALUES(0," + id + ", 'starch'," + req.body.starch + ")";
                      connection.query(sql, function (error, response) {
                        //Sugars
                        sql = "INSERT INTO users_diet_preferences VALUES(0," + id + ", 'totalsugars'," + req.body.sugar + ")";
                        connection.query(sql, function (error, response) {
                          //Glucose
                          sql = "INSERT INTO users_diet_preferences VALUES(0," + id + ", 'glucose'," + req.body.glucose + ")";
                          connection.query(sql, function (error, response) {
                            //Cholestrol
                            sql = "INSERT INTO users_diet_preferences VALUES(0," + id + ", 'cholestrol'," + req.body.cholestrol + ")";
                            connection.query(sql, function (error, response) {
                              //Calcium
                              sql = "INSERT INTO users_diet_preferences VALUES(0," + id + ", 'calcium'," + req.body.calcium + ")";
                              connection.query(sql, function (error, response) {
                                //Iron
                                sql = "INSERT INTO users_diet_preferences VALUES(0," + id + ", 'iron'," + req.body.iron + ")";
                                connection.query(sql, function (error, response) {
                                  if (error)
                                    console.log(error);
                                  connection.release();
                                  res.end();
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
      });
     
      }
  )


});
app.post('/securityquestions',function (req, res){
  
  database.getConnection(function(error, connection){
    if(error)
      {
        console.log(error);
        return;
      }
      var sql = "SELECT sec_ques1, sec_ques2 FROM USERS WHERE EMAIL = '" + req.body.email + "'";
      connection.query(sql, function (error, response) {
        if (error) 
          console.log(error);
        connection.release();
        res.end(JSON.stringify(response));
      });
    }
  )
  
});

app.post('/checksecurity',function (req, res){
  console.log(req.body);
  const data = {
    'authenticated' : ''
  }
  database.getConnection(function(error, connection){
    if(error)
      {
        console.log(error);
        return;
      }
      var sql = "SELECT sec_ans1, sec_ans2 FROM USERS WHERE EMAIL = '" + req.body.email + "' AND sec_ans1 = '" + req.body.ans1 + "' AND sec_ans2 = '" + req.body.ans2 + "'";
      connection.query(sql, function (error, response) {
        if (error) 
          console.log(error);
        console.log(response);
        if(response.length==1) 
        {
          data.authenticated = true;
        }
        else
          data.authenticated = false;
      
          console.log(data);
        connection.release();
        res.end(JSON.stringify(data));
      });
    }
  )
  
});



app.post('/resetpassword',function (req, res){
  database.getConnection(function(error, connection){
  
    if(error)
      {
        console.log(error);
        return;
      }
      var sql = "UPDATE LOGIN SET pwd = '" +req.body.password + "' WHERE EMAIL = '"  + req.body.email + "'";
      connection.query(sql, function (error, response) {
        if (error) 
          console.log(error);
        
          connection.release();
        res.end(JSON.stringify(response));
      });
    }
  )
  
});



app.post('/favorite-foods',function (req, res){
  database.getConnection(function(error, connection){
    if(error)
      {
        console.log(error);
        return;
      }
      var sql = "SELECT * FROM FOODS WHERE `FOOD NAME` IN (SELECT FOOD FROM FAVORITES WHERE EMAIL = '" + req.body.email + "')";
      connection.query(sql, function (error, response) {
        if (error) 
          console.log(error);
          connection.release();
        res.end(JSON.stringify(response));
      });
    }
  )
  
});



app.post('/updatedb',function (req, res){
 

  database.getConnection(function(error, connection){
    if(error)
      {
        console.log(error);
        return;
      }
      if(req.body.remove!=null)
      {
      for(var i = 0; i<req.body.remove.length; i++)
      {
        var sql_rem = "DELETE FROM FAVORITES WHERE FOOD = '" + req.body.remove[i] + "' AND EMAIL = '" + req.body.user + "'";
       
        connection.query(sql_rem, function (error, response) {
          if (error) 
          {
            console.log(error);
            return;
          }
         if(/* i == req.body.remove.length-1 &&  */req.body.add!=null)
          {
            for(var j = 0 ; j<req.body.add.length; j++)
            {
              var sql_add = "INSERT INTO FAVORITES VALUES ('" + req.body.user +"','" + req.body.add[j]['Food Name'] +"'," + 0 +")";
              if(j==req.body.add.length-1)
              {
                connection.release();
                res.end();
              }
              connection.query(sql_add, function (error, response) {
                if (error) 
                {
                  console.log(error);
                  return;
                }
              
              })
            }
          }
        }); 
      }
    }
   else if(req.body.add!=null)
    {

        for(var k = 0 ; k<req.body.add.length; k++)
            {
             
              var sql_add = "INSERT INTO FAVORITES VALUES ('" + req.body.user +"','" + req.body.add[k]['Food Name'] +"'," + 0 +")";
              if(k==req.body.add.length-1)
                {
                  connection.release();
                  res.end();
                }
                connection.query(sql_add, function (error, response) {
                if (error) 
                {
                  console.log(error);
                  return;
                }
                
              })
            }
          }
      else{
        connection.release();
        res.end();
      }

      
     /*  var sql = "INSERT INTO FAVORITES VALUES ('" + req.body.user +"','" + req.body.food +"'," + req.body.index +")";
      database.query(sql, function (error, response) {
        if (error) 
          console.log(error);
        res.end();
      }); */
     
    }
  )
 
  
});
//app.listen(3001);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
