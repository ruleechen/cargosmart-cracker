# CargoSmartCracker
A cracker local server for slide code verification of xxx.com

Environment
------------
- Install [Nodejs](https://nodejs.org/) >= v14.0.0

Start Server
------------
- Open **start.cmd** to start the server, default listen on port **6002**
- Message "**Server is listening on http&#58;//localhost:6002**" will prompt on server started.

Call Service
------------
Send http **POST** request with json body to **http&#58;//localhost:6002/json**
```json
{
  "ground": "data:image/png;base64,...",
  "brick": "data:image/png;base64,...",
}
```
- **ground**: is the ground base64 image data.
- **brick**: is the brick base64 image data.

Service Response
------------
```json
{
    "confidence": 0.8569,
    "x": 167,
    "y": 36,
}
```
- **confidence**: the confidence of matching. 1 is the 100% matched.
- **x**: the horizontal offset value of brick in ground. -1 when test failed.
- **y**: the vertical offset value of brick in ground. -1 when test failed.
