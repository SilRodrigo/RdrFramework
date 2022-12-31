# Guia de uso rdr_framework

## Como utilizar este recurso?
Neste exemplo importamos o renderer.js através de um script de tipo *module* no html, 
chamamos a função inject e passamos o objeto que queremos que seja renderizado.
Lembrando que o objeto deve extender a classe **FrameworkAbstractModel** que está no arquivo *abtract.js*.

Para usar esse exemplo tenha node instalado na sua máquina e na pasta raiz (aqui onde está esse arquivo) rode os comandos:
`npm install` e `npm start`
assim que a aplicação levantar, acesse:
`http://localhost:8888/`

Na pasta example/mock-api você terá um exemplo de api para trabalhar, 
fique à vontade para adicionar outras ou editar a que já existe.

### Lista de atributos
- **rdr-container**: Use para informar o nome do Model que deseja usar para popular o html.
- **rdr-get**: Use informando o nome da propriedade que deve ser impressa dentro do elemento.<br>
**Obs**: para os elementos ***a*** e ***img*** o atributo ***rdr-get*** irá popular as propriedades ***href*** e ***src*** respectivamente.
- **rdr-function**: Aplica uma função ao valor do inner-text do elemento, pode ser usado com ***rdr-get***.
- **rdr-each**: Itera sobre a propriedade informada, caso seja um array.<br>
**Obs**: O escopo do ***rdr-get*** se altera dentro do each.
- **rdr-if**: Valida o dado informado, caso seja falso, remove o elemento da DOM. 
**Obs**: Comece a validação com *this* para acessar o escopo. ex: rdr-if="this.items.length > 0"
- **rdr-load**: Use no mesmo elemento do rdr-container para adicionar uma classe de loading a cada update.

## FAQs

#### Q: Como vejo quais Models estão implementados ao core?
**R:**
- No console do navegador digite rdr ou window.rdr para ver a classe Core em execução.