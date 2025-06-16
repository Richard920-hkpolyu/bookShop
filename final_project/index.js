const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

//现在，您将确保所有仅限已验证用户的操作均被中间件拦截。以下代码确保所有以 /customer/auth 开头的端点都经过中间件。它从会话中检索授权详细信息并进行验证。如果令牌通过验证，则用户被授权，并将控制权传递给下一个端点处理程序。如果令牌无效，则用户未通过身份验证，并返回错误消息。
// Middleware to authenticate requests to "/customer/auth/" endpoint
app.use("/customer/auth/*", function auth(req,res,next){
// Check if user is logged in and has valid access token
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); // Proceed to the next middleware
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));


/*
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

//现在，您将确保所有仅限已验证用户的操作均被中间件拦截。以下代码确保所有以 /customer/auth 开头的端点都经过中间件。它从会话中检索授权详细信息并进行验证。如果令牌通过验证，则用户被授权，并将控制权传递给下一个端点处理程序。如果令牌无效，则用户未通过身份验证，并返回错误消息。
// Middleware to authenticate requests to "/customer/auth/" endpoint
app.use("/customer/auth/*", function auth(req,res,next){
// Check if user is logged in and has valid access token
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); // Proceed to the next middleware
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));

*/