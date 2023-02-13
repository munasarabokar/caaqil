const { response, request } = require('express');
var express = require('express');
var database = require('../db');
var router = express.Router();

/* GET home page still not done yet. */

router.get('/', function(request, response , next) {
  if (request.session.user_id) { 
    user_id = request.session.user_id;
    // check banned users
    if (request.session.role == 'banned') {
      response.render('index' , { title:"Expired" , caaqil:'banned' });
    }  else {
      // check susbcriber users
        var subs = `SELECT * FROM user_login WHERE role = "subscriber" AND CURRENT_TIMESTAMP >= expiretime AND user_id = "${user_id}"`;
        database.query(subs , function(error,data) {
          if (error) {
            response.redirect("/405");
          } else {
            if (data.length > 0) {
             var updatesub = `UPDATE user_login SET role = 'banned' , sabab = 'Waqtiga ka dhacay' WHERE user_id = ${user_id}`;
             database.query(updatesub,function(error,data){
             if (data) {
              // request.session.destroy();
              // response.redirect("/login");
               response.render('index' , { title:"Expired" , caaqil:'banned' });
             }
             });
            } else {
               // day analys
          var total_days = `SELECT SUM(qiimaha) as day FROM natiijo WHERE created_at > CURDATE() AND user_id = "${user_id}"`;
          database.query(total_days , function (error,data) {
            if (data.length > 0) {
              for(tiro = 0 ; tiro < data.length ; tiro ++) {
                day = data[tiro].day;
              }
            }
          });
          // week analys
          var total_week = `SELECT SUM(qiimaha) as week FROM natiijo WHERE WEEK(created_at) = WEEK(now()) AND user_id = "${user_id}"`;
          database.query(total_week , function (error,data) {
            if (data.length > 0) {
              for(tiro = 0 ; tiro < data.length ; tiro ++) {
                week = data[tiro].week;
              }
            }
          });
          // month analys
          var total_month = `select SUM(qiimaha) as month from natiijo where date_format(created_at,'%M') = date_format(now(),'%M') and date_format(created_at,'%M')=date_format(now(),'%M') AND user_id = "${user_id}"`;
          database.query(total_month , function (error,data) {
            if (data.length > 0) {
              for(tiro = 0 ; tiro < data.length ; tiro ++) {
                month = data[tiro].month;
              }
            }
          });
          // total all paid analys
          var total_month = `SELECT SUM(qiimaha) as total FROM natiijo WHERE user_id = "${user_id}"`;
          database.query(total_month , function (error,data) {
            if (data.length > 0) {
              for(tiro = 0 ; tiro < data.length ; tiro ++) {
                totalAll = data[tiro].total;
              }
            }
          });
                var query = `SELECT * FROM user_login WHERE user_id = "${user_id}"`;
                database.query(query, function(error , data){
                  if (error) {
                    response.redirect("/404");
                  } else {
                    if (data.length > 0)  {
                      response.render('index', { title: 'Munasar App' , caaqil:'home' , user:data[0] , day:day , week:week , month:month, totalAll:totalAll , message:request.flash('success') , role:request.session.role  });
                    } else {
                      response.redirect("/404");
                    }
                  
                  }
            });
            }
          }
        });
    
     
    }
   } else {
    request.flash('success' , 'bad');
    response.redirect("/login");
   } 
});

/* GET Login page. all most 99% done */

router.get("/login" , function (request , response , next ) {
  if (request.session.user_id) {
    response.redirect('/');
  } else {
  response.render('index' , {title : "Login" , caaqil : "login" , message:request.flash('success') , session : request.session })
  }
});

/* POST Login . all most done */

router.post('/login', function(request, response, next){
  if (request.session.user_id) { 
    request.flash('success' , 'goo');
    response.redirect("/");
   } else {
    var user_name = request.body.user_name;

  var user_password = request.body.user_password;

  if(user_name && user_password) {
    var query = (`
      SELECT * FROM user_login 
      WHERE user_name = "${user_name}"
      `);

      database.query(query, function(error, data){

          if(data.length > 0)  {
              for(var count = 0; count < data.length; count++)
              {
                  if(data[count].user_password == user_password) {
                      request.session.user_id = data[count].user_id;
                      request.session.role = data[count].role
                      request.session.expiretime = data[count].expiretime
                      if (request.session.user_id) {
                        request.flash('success' , 'succ');
                        response.redirect("/");
                      } else {
                        request.flash('success' , 'err');
                        response.redirect("/login");
                      }
                     
                  } else   {
                      request.flash('success' , 'pass');
                      response.redirect("/login");
                  }
              }
          }  else {
              request.flash('success' , 'email');
              response.redirect("/login");
          }
          response.end();
      });
  }
  else
  {
    request.flash('success' , 'email');
    response.redirect("/login");
  }
   }

});

/* GET admin users listing. */
router.get('/userlist', function(request, response, next) {
  if (request.session.user_id) {
     role = request.session.role;
     if (role == 'admin') {
        var query = `SELECT * FROM user_login ORDER BY user_id DESC LIMIT 15`;
      
        database.query(query , function(error , data ) {
        if (error) {
          response.redirect("/405");
        } else {
          response.render('index' , {title : "List Users" , ss : 'no' , caaqil:'admin_list_users'  , costumers:data , message: request.flash('success')})
        }
        });
     } else {
      user_id = request.session.user_id;
      var updatesub = `UPDATE user_login SET role = 'banned' , sabab = 'Qeybta admin ka inuu soo galo ayuu isku dayay' WHERE user_id = ${user_id}`;
             database.query(updatesub,function(error,data){
             if (data) {
               response.render('index' , { title:"Expired" , caaqil:'banned' });
             }
             });
     }
  } else {
   request.flash('success' , 'bad')
   response.redirect("/login");
  }
});


/* GET admin view users . */
router.get('/userid/:id', function(request, response, next) {
  number = request.params.id ;
  if (request.session.user_id) {
     role = request.session.role;
     if (role == 'admin') {
            var select = `SELECT * FROM user_login WHERE user_id = "${number}"`;
            database.query(select , function(error,data) {
          if (error) {
            response.redirect("/405")
          } else {
            if (data.length > 0) {
              for (var tiro = 0 ; tiro < data.length ; tiro++ ) {
                magac = data[tiro].user_name;
                cid = data[tiro].user_id;
                info = data[0];
                response.render('index' , { title: magac , info:info  , caaqil:"user_view" , message: request.flash('success')});
              
              }
            } else {
            response.redirect('/404');
            }
          }
        });
     } else {
      user_id = request.session.user_id;
      var updatesub = `UPDATE user_login SET role = 'banned' , sabab = 'Qeybta admin ka inuu soo galo ayuu isku dayay' WHERE user_id = ${user_id}`;
             database.query(updatesub,function(error,data){
             if (data) {
               response.render('index' , { title:"Expired" , caaqil:'banned' });
             }
             });
     }
  } else {
   request.flash('success' , 'bad')
   response.redirect("/login");
  }
});

/* GET admin view users . */
router.get('/deleteuser/:id', function(request, response, next) {
  id = request.params.id ;
  if (request.session.user_id) {
     role = request.session.role;
     if (role == 'admin') {
      var id = request.params.id ;
      var deletenow = `DELETE FROM user_login WHERE user_id = ${id}`;
      database.query(deletenow, function(error,data) {
        request.flash('success' , 'del');
        response.redirect("/userlist");
      });
     } else {
      user_id = request.session.user_id;
      var updatesub = `UPDATE user_login SET role = 'banned' , sabab = 'Qeybta admin ka inuu soo galo ayuu isku dayay' WHERE user_id = ${user_id}`;
             database.query(updatesub,function(error,data){
             if (data) {
               response.render('index' , { title:"Expired" , caaqil:'banned' });
             }
             });
     }
  } else {
   request.flash('success' , 'bad')
   response.redirect("/login");
  }
});

/* GET admin adding users . */

router.post('/addusers', function(request, response, next) {
  if (request.session.user_id) {
     role = request.session.role;
     if (role == 'admin') {
      var user_name = request.body.user_name ;
      var user_password = request.body.user_password ;
      var created_at = request.body.created_at ;
      var caaqil = (`INSERT INTO user_login (  user_name, user_password , expiretime ) VALUES ('${user_name}' ,'${user_password}', '${created_at}')`);
      database.query(caaqil , function(error , data ) {
        if(error) {
          response.redirect("/405");
        } else {
          request.flash('success' , 'adddone');
          response.redirect("/userlist");
        }
      });
     } else {
      user_id = request.session.user_id;
      var updatesub = `UPDATE user_login SET role = 'banned' , sabab = 'Qeybta admin ka inuu soo galo ayuu isku dayay' WHERE user_id = ${user_id}`;
             database.query(updatesub,function(error,data){
             if (data) {
               response.render('index' , { title:"Expired" , caaqil:'banned' });
             }
             });
     }
  } else {
   request.flash('success' , 'bad')
   response.redirect("/login");
  }
});

/* GET admin update users password . */

router.post('/updatepass', function(request, response, next) {
  if (request.session.user_id) {
     role = request.session.role;
     if (role == 'admin') {
      var user_password = request.body.user_password ;
      var users_id = request.body.user_id ;
      var caaqil = (`
      UPDATE user_login 
      SET user_password = "${user_password}"
      WHERE user_id = "${users_id}"
      `);
      database.query(caaqil , function(error , data ) {
        if(error) {
          response.redirect("/405");
        } else {
          request.flash('success' , 'updatedpass');
          response.redirect("/userid/"+users_id);
        }
      });
     } else {
      user_id = request.session.user_id;
      var updatesub = `UPDATE user_login SET role = 'banned' , sabab = 'Qeybta admin ka inuu soo galo ayuu isku dayay' WHERE user_id = ${user_id}`;
             database.query(updatesub,function(error,data){
             if (data) {
               response.render('index' , { title:"Expired" , caaqil:'banned' });
             }
             });
     }
  } else {
   request.flash('success' , 'bad')
   response.redirect("/login");
  }
});


/* GET admin update users role . */

router.post('/updaterole', function(request, response, next) {
  if (request.session.user_id) {
     role = request.session.role;
     if (role == 'admin') {
      var role = request.body.role ;
      var created_at = request.body.created_at ;
      var users_id = request.body.user_id ;
      var caaqil = (`
      UPDATE user_login 
      SET role = "${role}",
      expiretime = "${created_at}",
      sabab = "admin ka ayaa shaqadaan fuliyay"
      WHERE user_id = "${users_id}"
      `);
      database.query(caaqil , function(error , data ) {
        if(error) {
          response.redirect("/407");
        } else {
          request.flash('success' , 'updatedrole');
          response.redirect("/userid/"+users_id);
        }
      });
     } else {
      user_id = request.session.user_id;
      var updatesub = `UPDATE user_login SET role = 'banned' , sabab = 'Qeybta admin ka inuu soo galo ayuu isku dayay' WHERE user_id = ${user_id}`;
             database.query(updatesub,function(error,data){
             if (data) {
               response.render('index' , { title:"Expired" , caaqil:'banned' });
             }
             });
     }
  } else {
   request.flash('success' , 'bad')
   response.redirect("/login");
  }
});

/* GET admin search users listing. */

router.post('/usersearch', function(request, response, next) {
  if (request.session.user_id) {
     role = request.session.role;
     if (role == 'admin') {
        var search = request.body.search ;
        var select = `SELECT * FROM user_login WHERE user_name LIKE "%${search}%"`;
        database.query(select , function(error,data) {
          if (error) {
            response.redirect("/405");
          } else {
            response.render('index' , {title : search , caaqil : 'admin_list_users' , ss : 'yes' , costumers:data , message: request.flash('success') });
          }
        });
     } else {
      user_id = request.session.user_id;
      var updatesub = `UPDATE user_login SET role = 'banned' , sabab = 'Qeybta admin ka inuu soo galo ayuu isku dayay' WHERE user_id = ${user_id}`;
             database.query(updatesub,function(error,data){
             if (data) {
               response.render('index' , { title:"Expired" , caaqil:'banned' });
             }
             });
     }
  } else {
   request.flash('success' , 'bad')
   response.redirect("/login");
  }
});

/* GET List costumer page. all most done */

router.get("/tops" , function(request , response , next ) {
  user_id = request.session.user_id ;
  if (user_id) {
     if (request.session.role == 'banned') {
      response.render('index' , { title:"Expired" , caaqil:'banned' });
     } else {
      var query = `SELECT * FROM macaamiil WHERE user_id = "${user_id}" ORDER BY cid DESC LIMIT 10`;
    
      database.query(query , function(error , data ) {
       if (error) {
        response.redirect("/405");
       } else {
        response.render('index' , {title : "List Costumer" , ss : 'no' , caaqil:'all' , user__id:user_id , costumers:data , message: request.flash('success')})
       }
       });
     }
  } else {
    request.flash('success' , 'bad');
    response.redirect("/login");
  }
});

/* GET Profile page. */

router.get("/setting" , function(request , response , next ) {
  user_id = request.session.user_id
  if (user_id) {
  if (request.session.role == 'banned') {
    response.render('index' , { title:"Expired" , caaqil:'banned' });
  } else {
    var exxx = `SELECT * FROM user_login WHERE user_id = "${user_id}"`;
    database.query(exxx , function(error,data) {
      if (error) {
        response.redirect("/405");
      } else {
        if (data.length > 0) {
          for (tiro = 0 ; tiro < data.length ; tiro++) {
            expiretime = data[0].expiretime
            response.render('index' , { title: "Profile Setting" , message:request.flash('success') , caaqil:"setting" , expiretime:expiretime , role:request.session.role , info:data[0] });
          }
        }
      }
    });
  }
 
  } else {
    request.flash('success' , 'bad');
    response.redirect("/login");
  }
  
});

/* GET costumer details page  All most 100 % Done . */

router.get("/id/:id" , function(request , response , next ) {
  var number = request.params.id;
  user_id = request.session.user_id;
  if (user_id) {
      if (request.session.role == 'banned') {
        response.render('index' , { title:"Expired" , caaqil:'banned' });
      } else {
        var select = `SELECT * FROM macaamiil WHERE cid = "${number}" AND user_id = "${user_id}"`;
          database.query(select , function(error,data) {
        if (error) {
          response.redirect("/405")
        } else {
           if (data.length > 0) {
            for (var tiro = 0 ; tiro < data.length ; tiro++ ) {
              magac = data[tiro].name;
              cid = data[tiro].cid;
              info = data[0];
            
            }
           } else {
           response.redirect('/404');
           }
        }
      });
      var select = `SELECT * FROM natiijo WHERE cos_id = "${number}" ORDER BY id DESC LIMIT 5`;
        database.query(select,function(error,data) {
        response.render('index' , { title: magac , info:info ,  history:data , caaqil:"hormuud" , message: request.flash('success')});
      });
      }
  } else {
    request.flash('success' , 'bad');
    response.redirect("/login");
  }
});


/* POST adding costumer all most 100 done . */

router.post("/add" , function(request , response , next ) {
  if (request.session.user_id) {
    user_id = request.session.user_id ;
    var h_n = request.body.h_n ;
  var s_n = request.body.s_n ;
  var name = request.body.name ;
  var users_id = request.body.user_id ;
  var sss = `SELECT * FROM macaamiil WHERE user_id = "${user_id}" AND h_number = "${h_n}"`;
  database.query(sss , function(error , data) {
    if (error) {
      response.redirect("/405");
    } else {
      if (data.length > 0) {
        request.flash('success' , 'celis');
        response.redirect("/tops");
      } else {
        var caaqil = (`INSERT INTO macaamiil ( user_id ,name, h_number, s_number) VALUES ('${users_id}' ,'${name}', '${h_n}', '${s_n}')`);
        database.query(caaqil , function(error , data ) {
          if(error) {
            response.redirect("/405");
          } else {
            request.flash('success' , 'adddone');
            response.redirect("/tops");
          }
        });
      }
    }
  })

  }  else {
   request.flash('success' , 'bad');
   response.redirect("/login");
  } 
});

/* POST update costumer . */

router.post("/update" , function(request , response , next ) {
  if (request.session.user_id) {
    var h_n = request.body.h_n ;
  var s_n = request.body.s_n ;
  var name = request.body.name ;
  var users_id = request.body.user_id ;
  var caaqil = (`
  UPDATE macaamiil 
  SET name = "${name}", 
  h_number = "${h_n}", 
  s_number = "${s_n}"
  WHERE cid = "${users_id}"
  `);
  database.query(caaqil , function(error , data ) {
    if(error) {
      response.redirect("/405");
    } else {
      request.flash('success' , 'updated');
      response.redirect("/id/"+users_id);
    }
  });
  }  else {
   request.flash('success' , 'bad');
   response.redirect("/login");
  } 
});

/* POST update user user_name . */

router.post("/changeuser" , function(request , response , next ) {
  if (request.session.user_id) {
    var user_name = request.body.user_name ;
  var users_id = request.body.user_id ;
  var caaqil = (`
  UPDATE user_login 
  SET user_name = "${user_name}"
  WHERE user_id = "${users_id}"
  `);
  database.query(caaqil , function(error , data ) {
    if(error) {
      response.redirect("/405");
    } else {
      request.flash('success' , 'updated');
      response.redirect("/setting");
    }
  });
  }  else {
   request.flash('success' , 'bad');
   response.redirect("/login");
  } 
});

/* POST update user password . */

router.post("/changepass" , function(request , response , next ) {
  if (request.session.user_id) {
    var user_password = request.body.user_password ;
    var users_id = request.body.user_id ;
    var caaqil = (`
    UPDATE user_login 
    SET user_password = "${user_password}"
    WHERE user_id = "${users_id}"
    `);
  database.query(caaqil , function(error , data ) {
    if(error) {
      response.redirect("/405");
    } else {
      request.session.destroy();
      response.redirect("/login");
    }
  });
  }  else {
   request.flash('success' , 'bad');
   response.redirect("/login");
  } 
});

/* POST search costumer all most 99 % done . */

router.post("/search" , function(request ,response ,next) {
 user_id = request.session.user_id ;
 if (user_id) {
  var search = request.body.search ;
  var select = `SELECT * FROM macaamiil WHERE h_number LIKE "%${search}%" AND user_id = "${user_id}"`;
  database.query(select , function(error,data) {
    if (error) {
      response.redirect("/405");
    } else {
      response.render('index' , {title : search , caaqil : 'all' , ss : 'yes' , costumers:data ,user__id:user_id , message:request.flash('success') });
    }
  });
 } else {
  request.flash('success' , 'bad');
  response.redirect("/login");
 }
});

/* GET Transection page all most 99 % done . */

router.post("/trassection" , function(request,response,next) {
  user_id = request.session.user_id;
  if (user_id) {  
   cid = request.body.cid ;
   q_in = request.body.qiimaha;
   s_n = request.body.cid_number;
   q_o = request.body.qiimaha_o;
   var select = `INSERT INTO natiijo (user_id, cos_id, qiimaha ) VALUES ("${user_id}","${cid}", "${q_in}")`;
   database.query(select, function(error,data) {
    if (error) { 
      throw error
       //response.redirect("/405");
    } else {
      var sending = '';
      if (q_o == 'daato') {
        var sending = "tel:*830*"+s_n+"*"+q_in+"#";
        response.render("index" , {title:"sent" , caaqil : 'sent' , sending:sending , num:s_n , lacag:q_o });
      } else {
        var sending = "tel:*831*"+s_n+"*"+q_o+"#";
         response.render("index" , {title:"sent" , caaqil : 'sent' , sending:sending , num:s_n , lacag:q_o });
      }
    }
   });
  } else {
    request.flash('success' , 'bad') ;
    response.redirect("/login");
  }
});

/* GET delete page Total 100% done . */

router.get("/delete/:id" , function(request , response , next) {
   user_id = request.session.user_id ;
   role = request.session.role ;

   if (user_id) {
    if (role == 'banned') {
      response.render('index' , { title:"Expired" , caaqil:'banned' });
    } else {
      var id = request.params.id ;
      var deletenow = `DELETE FROM macaamiil WHERE cid = ${id}`;
      database.query(deletenow, function(error,data) {
        request.flash('success' , 'del');
        response.redirect("/tops");
      });
    }
   } else {
    request.flash('success' , 'bad');
    response.redirect("/login");
   }
});

/* GET delete history page Total 100% done . */

router.get("/delhistory/:id" , function(request , response , next) {
user_id = request.session.user_id ;
role = request.session.role ;
if (user_id) {
  if (role == 'banned') {
    response.render('index' , { title:"Expired" , caaqil:'banned' });
  } else {
    var ids = request.params.id ;
    var vars = `SELECT * FROM natiijo WHERE id = "${ids}"`;
    database.query(vars,function(error,data) {
      if (error) {
        response.redirect("/405");
      } else {
        if (data.length > 0) {
         for(tiro = 0 ; tiro < data.length ;tiro ++){
  
          co = data[tiro].cos_id;
          co_id = data[tiro].id;
          var deletenow = `DELETE FROM natiijo WHERE id = ${co_id}`;
          database.query(deletenow, function(error,data) {
            if (error) {
              response.redirect('/405');
            } else {
               request.flash('success' , 'delhistorydone');
               response.redirect("/id/"+co);
            }
          });
         }
         //response.redirect("/406");
        } else {
          response.redirect("/405");
        }
      }
    }); 
  }
} else {
  
}
 
});

/* GET logout page Total 100% done . */

router.get('/logout', function(request, response, next){
 // request.flash('success' , 'bad');
  request.session.destroy();
  response.redirect("/login");

});

module.exports = router;
