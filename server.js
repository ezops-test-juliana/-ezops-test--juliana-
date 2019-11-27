/** 
 * Arquivo: server.js
 * Descrição: Arquivo responsável por levantar o serviço do Node.Js para poder
 * executar a aplicação.
 * Author: Juliana Almeida
 * Data de Criação: 24/11/2019
 */

//Configuração Base da Aplicação:
//====================================================================================
/* Chamada das Packages que iremos precisar para a nossa aplicação */
var express = require('express');					//chamando o pacote express
var bodyParser = require('body-parser')             //chamando o pacote body-parser
var app = express();                                //definção da nossa aplicação através do express
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');


/** Configuração da variável 'app' para usar o 'bodyParser()'.
 * Ao fazermos isso nos permitirá retornar os dados a partir de um POST
 */

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

var Message = mongoose.model('Message',{
  name : String,
  message : String
})

//Conexão com MongoDb
var dbUrl = 'mongodb+srv://JULIANA:JULIANA@cluster0-vk5fz.mongodb.net/simple-chat'

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})

app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})

app.post('/messages', async (req, res) => {
  try{
    var message = new Message(req.body);

    var savedMessage = await message.save()
      console.log('saved');

    var censored = await Message.findOne({message:'badword'});
      if(censored)
        await Message.remove({_id: censored.id})
      else
        io.emit('message', req.body);
      res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log('error',error);
  }
  finally{
    console.log('Mensagem Publicada')
  }

})

io.on('connection', () =>{
  console.log('Usuário Conectado...')
})

mongoose.connect(dbUrl , { useNewUrlParser: true }).then(() => {
	console.log("MONGODB Conectado...");
}).catch((err) => {
    console.log("Not Connected to Database ERROR! ", err);
});

//Iniciando o Servidor (Aplicação):
//==============================================================
var server = http.listen(3000, () => {
  console.log('Servidor está sendo executado na porta:', server.address().port);
}); 
