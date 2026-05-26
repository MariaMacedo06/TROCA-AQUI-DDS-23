// importação do model
const usuarioModel = require("../models/usuarioModel.js")

// importar pacotes
// para criptrograffia
const bcrypt = require('bcrypt')
// para lidar com cookies
const jwt = require('jsonwebtoken')

module.exports = {
    //FUNÇÕES DE LOGIN
    login: async (req, res) => {
        try {
            // Pega as infomações das caixinhas da view, de acordo com o name delas
            const { email, senha } = req.body

            // Executa a função de busca no model
            const usuario = await usuarioModel.buscarPorEmail(email)
            // Se não existir, mensagem de erro
            if (!usuario) return res.status(404).render('erro', { mensagem: "Credenciais inválidas" })

            // compara a senha que o usuário digitou, com a senha do usuario retornado no banco
            const senhaValida = await bcrypt.compare(senha, usuario.senha)
            // Se senhas não coincidirem, mensagem de erro
            if (!senhaValida) return res.status(404).render('erro', { mensagem: "Credenciais inválidas" })

            // Gera o token de acesso, contendo o perfil 
            const token = jwt.sign(
                { id: usuario.id, perfil: usuario.perfil, nome: usuario.nome },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            )

            // Guardar o token nos cookies do navegador
            res.cookie('token', token, { httpOnly: true })

            // Redirecionamento de acordo com o perfil
            if (usuario.perfil === "administrador") return res.redirect("/usuarios")
            if (usuario.perfil === "ofertante") return res.redirect("/produtos/meus-produtos")
            if (usuario.perfil === "interessado") return res.redirect("/produtos/vitrine")
        }
        catch (erro) {
            res.status(500).render('erro', { mensagem: "Erro interno no servidor" })
        }
    },
    logout: (req, res) => {
        //Limpa o token dos cookies
        res.clearCookie('token')
        // Volta pra tela de login
        res.redirect("/login")
    },
    cadastar: (req, res) => {
        try {
            // Objeto c/ informações preenchidas nos inputs
            const { nome, email, senha, telefone, perfil } = req.body

            // Não deixa o usuário cadastrar adm
            if (perfil === "administrador") {
                return res.status(403).render('erro', { mensagem: "Você não possui acesso" })
            }

            // Multer salva a img na pasta, e a variável guarda o nome dela, caso o usuário tenha anexado a imagem
            const fotoDaPessoa = req.file ? `uploads/usuarios/${req.file.filename}` : null

            // Criptografa a senha do usuário
            const senhaHash = bcrypt.hash(senha, 10)

            // Chama o model passando as informações já corrigidas
            await usuarioModel.criarUsuario(nome, email, senhaHash, telefone, fotoDaPessoa, perfil)

            // Variável p/ guardar onde tem que redirevionar o usuário
            let redirecionadoPara = "/login"

            // Verifica se já tem alguém logado, analisando se há token ativo
            if (req.cookies && req.cookies.token) {
                try {
                    // Lê o token, se o usuário for adm, redireciona p/ tela geral dos adm
                    const decodificado = jwt.verify(req.cookies.token, process.env.JWT_SECRET)
                    if (decodificado.perfil === "administrador") {
                        redirecionadoPara = "/usuarios"
                    }
                }
                catch (erro) {
                    // Segue o jogo indo p/ login msm
                }           
            }
            // Ao fim, redireciona o usuário p/ onde tem que ir, /login ou /usuarios
            res.redirect(redirecionadoPara)
        }
        catch(erro){
            console.error(erro)
            res.status(500).render('erro', { mensagem: "Erro ao cadastrar usuário" })
        }
    }
}