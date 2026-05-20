// IMPORTAÇÃO DOS MÓDULOS NECESSÁRIOS
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do diskStorage, lugar onde as imagens serão armazenadas
const storage = multer.diskStorage({
    // Definição da pasta de destino
    destination: (req, file, cb) => {
        // Pasta reserva para caso dê errado
        let pastaDestino = 'gerais'

        if(req.originalUrl.includes('/usuarios')) {
            pastaDestino = 'usuarios'
        }
        else if(req.originalUrl.includes('/produtos')) {
            pastaDestino = 'produtos'
        }
        // Variável que guarda o caminho da pasta pincipal 
        const uploadPath = path.join(__dirname, `../../client/public/uploads/${pastaDestino}`)
        // Se não existir a pasta, o node tenta criar com módulo fs
        if (!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        // Função de callback, null diz quenão houve erro nenhum, e retorno o caminho para a imagem
        cb(null, uploadPath)
    },
    // Função para alterar o nome do arquivo
    filename: (req, file, cb) => {
        // Pega a data atual 
        const timestamp = Date.now()
        // Gera um número aleeatório
        const numeroAleatorio = Math.floor(Math.random() * 1E9)
        // Pega a extensão do arquivo
        const extensaoDoArquivo = path.extname(file.originalname)

        // Variável com o nome final do arquivo, já com as alterações para evitar duplicatas 
        const nomeFinalSeguro = `${timestamp}-${numeroAleatorio}${extensaoDoArquivo}` 
        
        // Função de callback, null diz que não houve erro nenhum, e retorna o nome para a imagem
        cb(null, nomeFinalSeguro)
    }
})

const upload = multer({storage: storage})

module.exports = upload;