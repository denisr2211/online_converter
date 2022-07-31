const selectFrom = document.getElementById('selectFrom');
const selectTo = document.getElementById('selectTo');
const inputFrom = document.getElementById('inputFrom');
const inputTo = document.getElementById('inputTo');
// let currencyList = '';

 (async function (){
    const res = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
    let data = await res.json();
    console.log({data});
    data.push({cc: "UAH",
    exchangedate: "01.08.2022",
    r030: 980,
    rate: 1,
    txt: "Гривня"});

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
            return (element.r030 == selectFrom.value);
        });
        
        let selectToValue = data.find((element)=>{
            return (element.r030 == selectTo.value)
        });
        let crossCur = selectFromValue.rate/selectToValue.rate;
        inputTo.value = (crossCur * inputFrom.value).toFixed(2);
        
};