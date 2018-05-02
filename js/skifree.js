(function () {

   const FPS = 50;
   const TAMX = 300;
   const TAMY = 400;
   const PROB_ARVORE = 2;
   var gameLoop;
   var montanha;
   var skier;
   var direcoes = ['para-esquerda','para-frente','para-direita']
   var arvores = [];

   function init () {
      montanha = new Montanha();
      skier = new Skier();
      gameLoop = setInterval(run, 1000/FPS);
   }

   window.addEventListener('keydown', function (e) {
      if (e.key == 'a') skier.mudarDirecao(-1);
      else if (e.key == 'd') skier.mudarDirecao(1);
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
      this.element.style.top = '30px';
      this.element.style.left = parseInt(TAMX/2)-7 + 'px';

      this.mudarDirecao = function (giro) {
         if (this.direcao + giro >=0 && this.direcao + giro <=2) {
            this.direcao += giro;
            this.element.className = direcoes[this.direcao];
         }
      }

      this.andar = function () {
         if (this.direcao == 0) {
            this.element.style.left = (parseInt(this.element.style.left)-1) + "px";
         }
         if (this.direcao == 2) {
            this.element.style.left = (parseInt(this.element.style.left)+1) + "px";
         }         
      }
   }

   function Arvore() {
      this.element = document.createElement('div');
      montanha.element.appendChild(this.element);
      this.element.className = 'arvore';
      this.element.style.top = TAMY + "px";
      this.element.style.left = Math.floor(Math.random() * TAMX) + "px";
   }

   function run () {
      var random = Math.floor(Math.random() * 1000);
      if (random <= PROB_ARVORE*10) {
         var arvore = new Arvore();
         arvores.push(arvore);
      }
      arvores.forEach(function (a) {
         a.element.style.top = (parseInt(a.element.style.top)-1) + "px";
      });
      skier.andar();
   }

   init();

})();