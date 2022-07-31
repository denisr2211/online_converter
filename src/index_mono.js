const NodeCache = require( "node-cache" );
var cc = require('currency-codes');

const selectFrom = document.getElementById('selectFrom');
const selectTo = document.getElementById('selectTo');
const inputFrom = document.getElementById('inputFrom')
const inputTo = document.getElementById('inputTo');
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );

async function getCurrency(){
    let value = myCache.get("values");
    if (!value){
        console.log('cache not found');
        let response = await fetch('https://api.monobank.ua/bank/currency');
        let data = await response.json();
        myCache.set("values", data, 600);
        return data;
    }
    else{
        console.log('cache found');
        return value;
    }
    
}

async function getCur(){
    const data = await getCurrency()
    console.log({data});

    let options = data.map(item => {
        if (item.rateBuy!=undefined) {
        return  `<option value="${item.currencyCodeA}">${item.rateBuy}</option>`;
        } else {
            return  `<option value="${item.currencyCodeA}">${item.rateCross}</option>`;
        }
    });
    console.log({options});
    
    selectFrom.innerHTML = options.join("\n");
    selectTo.innerHTML = options.join("\n");

    inputFrom.addEventListener('change', () => convert(data));
    selectFrom.addEventListener('change', () => convert(data));
    selectTo.addEventListener('change', () => convert(data));

};

getCur();

function convert(data) {
    let selectFromValue = data.find((element) => {
        return (element.currencyCodeA == selectFrom.value);
    });

    let selectToValue = data.find((element) => {
        return (element.currencyCodeA == selectTo.value)
    });
    let crossCur = selectFromValue.rateBuy / selectToValue.rateBuy;
    inputTo.value = (crossCur * inputFrom.value).toFixed(2);

};