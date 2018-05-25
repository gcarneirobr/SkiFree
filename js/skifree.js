(function () {

    const FPS = 50;
    const TAMX = 300;
    const TAMY = 400;
    const PROB_ARVORE = 2;
    const FREQUENCIA_HOMEM_MONTANHA = 500;
    const MARGEM_COLISAO = 2;
    const TEMPO_SKIER_PARADO_COLISAO = 100;
    var gameLoop;
    var montanha;
    var skier;
    var direcoes = ['para-esquerda', 'para-frente', 'para-direita']
    var classesObstaculo = ['arvore', 'arvore-chamas', 'rocha', 'toco', 'cachorro', 'arvore-grande'];
    var arvores = [];
    var homemMontanha = null;

    function testColisao(a, b) {
        var styleA = window.getComputedStyle ? getComputedStyle(a.element, null) : a.element.currentStyle;
        var topA = styleA.top;
        topA = parseInt(topA.substring(0, topA.length - 2));
        var leftA = styleA.left;
        leftA = parseInt(leftA.substring(0, leftA.length - 2));
        var heightA = styleA.height;
        heightA = parseInt(heightA.substring(0, heightA.length - 2));
        var widthA = styleA.width;
        widthA = parseInt(widthA.substring(0, widthA.length - 2));

        var styleB = window.getComputedStyle ? getComputedStyle(b.element, null) : b.element.currentStyle;

        var topB = styleB.top;
        topB = parseInt(topB.substring(0, topB.length - 2));
        var leftB = styleB.left;
        leftB = parseInt(leftB.substring(0, leftB.length - 2));
        var heightB = styleB.height;
        heightB = parseInt(heightB.substring(0, heightB.length - 2));
        var widthB = styleB.width;
        widthB = parseInt(widthB.substring(0, widthB.length - 2));

        var cantoInferiorDireito =  ((topB <= topA + heightA) && (leftB <= leftA + widthA)) && ((topB+heightB >= topA+heightA) && (leftB+widthB >=leftA+widthA));
        var cantoSuperiorDireito =  ((topB + heightB >= topA) && (leftB < leftA + widthA)) && ((topB <= topA) && (leftB + widthB >= leftA + widthA));
        var cantoSuperiorEsquerdo =  ((leftB + widthB >= leftA) && (topB + heightB >= topA)) && ((topB <= topA) && (leftB <= leftA));
        var cantoInferiorEsquerdo =  ((topB <= topA + heightA) && (leftB + widthB >= leftA)) && ((topB + heightB >= topA + heightA) && (leftB <= leftA));

        var result = cantoInferiorDireito || cantoInferiorEsquerdo || cantoSuperiorDireito || cantoSuperiorEsquerdo;

        return result;

    }

    function init() {
        montanha = new Montanha();
        skier = new Skier();
        gameLoop = setInterval(run, 1000 / FPS);
    }

    window.addEventListener('keydown', function (e) {
        if (e.key == 'a') skier.mudarDirecao(-1);
        else if (e.key == 'd') skier.mudarDirecao(1);
        else if (e.key == 'f') skier.mudarVelocidade();
    });

    function Montanha() {
        this.element = document.getElementById("montanha");
        this.element.style.width = TAMX + "px";
        this.element.style.height = TAMY + "px";

        this.fimJogo = function () {

            clearInterval(gameLoop);
        }
    }

    function Skier() {

        this.element = document.getElementById("skier");
        this.direcao = 1; //0-esquerda;1-frente;2-direita
        this.element.className = 'para-frente';
        this.element.style.top = '140px';
        this.element.style.left = parseInt(TAMX / 2) - 7 + 'px';
        this.velocidade = 20;
        this.vidas = 3;
        this.pontuacao = 0;
        this.ultimoHomemMontanha = 0;
        this.parado = 0;
        this.functionTempoParado;

        this.mudarDirecao = function (giro) {
            if (this.direcao + giro >= 0 && this.direcao + giro <= 2) {
                this.direcao += giro;
                this.element.className = direcoes[this.direcao];
            }
        }

        this.andar = function () {

            var style = window.getComputedStyle ? getComputedStyle(this.element, null) : this.element.currentStyle;

            var left = style.left;
            left = left.substring(0, left.length - 2);

            var width = style.width;
            width = width.substring(0, width.length - 2);

            if (this.direcao == 0) {
                if (parseInt(left) > 0) {
                    this.element.style.left = (parseInt(this.element.style.left) - 1) + "px";
                } else {
                    this.element.className = 'para-frente';
                    this.mudarDirecao(1)
                }
            }
            if (this.direcao == 2) {
                if ((parseInt(left) + parseInt(width)) < TAMX) {
                    this.element.style.left = (parseInt(this.element.style.left) + 1) + "px";
                } else {
                    this.element.className = 'para-frente';
                    this.mudarDirecao(-1);
                }
            }

            this.pontuacao += this.velocidade / 1000 * FPS;
        }

        this.mudarVelocidade = function () {
            if (this.velocidade == 20) {
                this.velocidade = 30;
            } else this.velocidade = 20;
        }

        this.atualizarPlacar = function () {
            var vidas = document.getElementById("vidas");
            var pontuacao = document.getElementById("metros");
            var velocidade = document.getElementById("velocidade");
            pontuacao.innerHTML = Math.round(this.pontuacao) + " metros";
            vidas.innerHTML = this.vidas;
            velocidade.innerHTML = this.velocidade + " m/s";
        }

        this.animacaoBatida = function (arvore, arrayArvores) {
            this.parado = 1;
            this.tempo = 0;
            this.contador = 0;
            this.element.style.className = 'skier-batida-arvore';
            this.arvores = arrayArvores;
            this.arvore = arvore;
            var instanciaSkier = this;
            
            
            this.functionTempoParado = setInterval(function() {
                var display = ['block', 'none'];
                instanciaSkier.element.style.display = display[instanciaSkier.tempo % 2];
                if (instanciaSkier.tempo > 3) {
                    instanciaSkier.parado = 0;
                    clearInterval(instanciaSkier.functionTempoParado);
                    instanciaSkier.element.style.className = direcoes[this.direcao];
                    instanciaSkier.arvore.animacaoBatida(instanciaSkier.arvores);
                };               
                instanciaSkier.tempo++;
                
            }, TEMPO_SKIER_PARADO_COLISAO);
            
        }

        this.animacaoHomemMontanha = function () {

        }
    }

    function Arvore() {
        this.element = document.createElement('div');
        montanha.element.appendChild(this.element);
        this.probabilidade = Math.random() * 100;
        this.indexClasse;
        if (this.probabilidade < 40) {
            this.indexClasse = 0;
        } else if (this.probabilidade < 55) {
            this.indexClasse = 1;
        } else if (this.probabilidade < 70) {
            this.indexClasse = 2;
        } else if (this.probabilidade < 80) {
            this.indexClasse = 3;
        } else if (this.probabilidade < 90) {
            this.indexClasse = 4;
        } else this.indexClasse = 5;

        this.element.className = classesObstaculo[this.indexClasse];
        this.element.style.top = TAMY + "px";
        this.element.style.left = Math.floor(Math.random() * TAMX) + "px";
        this.continuaNoJogo = true;
        this.contadorAnimacao = 1;
        this.functionAnimacao;

        this.andar = function (vel) {
            this.element.style.top = (parseInt(this.element.style.top) - (1 * vel / 20)) + "px";
        }

        this.saiuTela = function () {
            var style = window.getComputedStyle ? getComputedStyle(this.element, null) : this.element.currentStyle;

            var top = style.top;
            top = top.substring(0, top.length - 2);

            var height = style.height;
            height = height.substring(0, height.length - 2);

            if (parseInt(top) + parseInt(height) < 0) {
                return true;
            }
            return false;
        }

        this.animacaoBatida = function (arvores) {
            
            this.contadorAnimacao = 0;
            this.continuaNoJogo = 0;
            var display = ['block', 'none'];
            this.arvores = arvores;
            var instanciaArvore = this;

            if (!skier.parado) {
                this.functionAnimacao = setInterval(function() {
                    if (instanciaArvore.contadorAnimacao > 6) {
                        instanciaArvore.removeArvore(arvores);
                        clearInterval(instanciaArvore.functionAnimacao);
                    }
                    instanciaArvore.contadorAnimacao++;
                    instanciaArvore.element.style.display = display[instanciaArvore.contadorAnimacao % 2];
                }, 200);
            }
        }

        this.removeArvore = function(arvores) {
            var index = arvores.indexOf(this);
            arvores.splice(index, 1);
            montanha.element.removeChild(this.element);
        }

    }

    function HomemMontanha() {
        this.element = document.createElement('div');
        montanha.element.appendChild(this.element);
        this.element.className = 'homem-montanha';
        this.element.style.top = '20px';
        this.element.style.left = skier.element.style.left;
        this.velocidade = 25;

        this.saiuTela = function () {

            var style = window.getComputedStyle ? getComputedStyle(this.element, null) : this.element.currentStyle;

            var top = style.top;
            top = top.substring(0, top.length - 2);

            var height = style.height;
            height = height.substring(0, height.length - 2);

            if (parseInt(top) + parseInt(height) < 0) {
                return true;
            }
            return false;

        }

        this.andar = function (skier) {
            this.element.style.top = (parseInt(this.element.style.top) + (this.velocidade - skier.velocidade) / 3) + 'px';
            this.element.style.left = skier.element.style.left;
        }
    }

    function Cogumelo() {

        this.element = document.createElement('div');
        montanha.element.appendChild(this.element);
        this.element.className = 'cogumelo';
        this.element.style.top = '20px';
        this.element.style.left = Math.floor(Math.random() * TAMX) + "px";
    }

    function run() {

        if (!skier.parado) {

            var random = Math.floor(Math.random() * 1000);
            if (random <= PROB_ARVORE * 10) {
                var arvore = new Arvore();
                arvores.push(arvore);
            }

            arvores.forEach(function (a) {
                a.andar(skier.velocidade);

                if (a.continuaNoJogo && !a.saiuTela()) {
                    if (testColisao(skier, a)) {
                        skier.vidas--;
                        skier.animacaoBatida(a, arvores);
                        if (skier.vidas < 0) {
                            montanha.fimJogo();
                        }
                    }
                }
            
                if (a.saiuTela()) {
                    a.removeArvore(arvores);
                }
            });

            skier.andar();

            if (!(homemMontanha === null)) {
                homemMontanha.andar(skier);
                if (testColisao(skier, homemMontanha)) {
                    skier.animacaoHomemMontanha();
                    montanha.fimJogo();
                }
                if (homemMontanha.saiuTela()) {
                    homemMontanha = null;
                    skier.ultimoHomemMontanha = skier.pontuacao;
                }
            }
            if ((homemMontanha === null) && (skier.ultimoHomemMontanha + FREQUENCIA_HOMEM_MONTANHA < skier.pontuacao)) {
                homemMontanha = new HomemMontanha();
            }
            skier.atualizarPlacar();
        }
    }

    init();

})();