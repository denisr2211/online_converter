const selectFrom = document.getElementById('selectFrom');
const selectTo = document.getElementById('selectTo');
const inputFrom = document.getElementById('inputFrom');
const inputTo = document.getElementById('inputTo');
// let currencyList = '';

 (async function (){
    const res = await fetch('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5');
    let data = await res.json();
    console.log({data});

    let options = data.map(item => {
        return  `<option value="${item.r030}">${item.cc}</option>`;
    });
    
    selectFrom.innerHTML = options.join("\n");
    selectTo.innerHTML = options.join("\n");

    inputFrom.addEventListener('change', () => convert(data));
    selectFrom.addEventListener('change', () => convert(data));
    selectTo.addEventListener('change', () => convert(data));

})();

function convert(data) {
        let selectFromValue = data.find((element)=>{
            return (element.ccy == selectFrom.value);
        });
        
        let selectToValue = data.find((element)=>{
            return (element.ccy == selectTo.value)
        });
        let crossCur = selectFromValue.rate/selectToValue.buy;
        inputTo.value = (crossCur * inputFrom.value).toFixed(2);
        
};