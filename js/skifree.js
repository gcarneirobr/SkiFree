(function () {

   const FPS = 50;
   const TAMX = 300;
   const TAMY = 400;
   const PROB_ARVORE = 2;
   const FREQUENCIA_HOMEM_MONTANHA = 500;
   var gameLoop;
   var montanha;
   var skier;
   var direcoes = ['para-esquerda','para-frente','para-direita']
   var arvores = [];
   var homemMontanha = null;

   function init () {
      montanha = new Montanha();
      skier = new Skier();
      gameLoop = setInterval(run, 1000/FPS);
   }

   window.addEventListener('keydown', function (e) {
      if (e.key == 'a') skier.mudarDirecao(-1);
      else if (e.key == 'd') skier.mudarDirecao(1);
      else if (e.key == 'f') skier.mudarVelocidade();
   });

   function Montanha () {
      this.element = document.getElementById("montanha");
      this.element.style.width = TAMX + "px";
      this.element.style.height = TAMY + "px";
   }

   function Skier() {

      this.element = document.getElementById("skier");
      this.direcao = 1; //0-esquerda;1-frente;2-direita
      this.element.className = 'para-frente';
      this.element.style.top = '140px';
      this.element.style.left = parseInt(TAMX/2)-7 + 'px';
      this.velocidade = 20;
      this.vidas = 3;
      this.pontuacao = 0;
      this.ultimoHomemMontanha = 0;

      this.mudarDirecao = function (giro) {
         if (this.direcao + giro >=0 && this.direcao + giro <=2) {
            this.direcao += giro;
            this.element.className = direcoes[this.direcao];
         }
      }

      this.andar = function () {

        var style = window.getComputedStyle ? getComputedStyle(this.element, null) : this.element.currentStyle;

        var left = style.left;
        left = left.substring(0, left.length-2);

        var width = style.width;
        width = width.substring(0, width.length-2);

         if (this.direcao == 0) {
            if (parseInt(left) > 0) {
                this.element.style.left = (parseInt(this.element.style.left)-1) + "px";
            } else {
                this.element.className = 'para-frente';
                this.mudarDirecao(1)
            }
         }
         if (this.direcao == 2) {
             if ((parseInt(left) + parseInt(width)) < TAMX) {
                this.element.style.left = (parseInt(this.element.style.left)+1) + "px";
             } else {
                 this.element.className = 'para-frente';
                 this.mudarDirecao(-1);
             }
         }         
         

         this.pontuacao += this.velocidade/1000*FPS;
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
   }

   function Arvore() {
      this.element = document.createElement('div');
      montanha.element.appendChild(this.element);
      this.element.className = 'arvore';
      this.element.style.top = TAMY + "px";
      this.element.style.left = Math.floor(Math.random() * TAMX) + "px";

      this.andar = function (vel) {
        this.element.style.top = (parseInt(this.element.style.top) - (1*vel/20)) + "px";
      }
   }

   function HomemMontanha() {
       this.element = document.createElement('div');
       montanha.element.appendChild(this.element);
       this.element.className = 'homem-montanha';
       this.element.style.top = '20px';
       this.element.style.left = skier.element.style.left;
       this.velocidade = 25;

       this.saiuTela = function() {

        var style = window.getComputedStyle ? getComputedStyle(this.element, null) : this.element.currentStyle;

        var top = style.top;
        top = top.substring(0, top.length-2);

        var height = style.height;
        height = height.substring(0, height.length-2);

        if (parseInt(top) + parseInt(height) < 0) {
            return true;
        }
        return false;
           
       }
      
       this.andar = function (skier) {
           this.element.style.top = (parseInt(this.element.style.top) + (this.velocidade - skier.velocidade)/3) + 'px';
           this.element.style.left = skier.element.style.left;
       }
   }

   function run () {
      var random = Math.floor(Math.random() * 1000);
      if (random <= PROB_ARVORE*10) {
         var arvore = new Arvore();
         arvores.push(arvore);
      }
      arvores.forEach(function (a) {
         a.andar(skier.velocidade)
      });
      skier.andar();
      if (!(homemMontanha === null)) {
          homemMontanha.andar(skier);
          if (homemMontanha.saiuTela()){
              homemMontanha = null;
          }
      }
      if ((homemMontanha === null) && (skier.ultimoHomemMontanha + FREQUENCIA_HOMEM_MONTANHA < skier.pontuacao)) {
          skier.ultimoHomemMontanha = skier.pontuacao;
          homemMontanha = new HomemMontanha();
      }
      skier.atualizarPlacar();
   }

   init();

})();