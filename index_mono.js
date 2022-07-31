const selectFrom = document.getElementById('selectFrom');
const selectTo = document.getElementById('selectTo');
const inputFrom = document.getElementById('inputFrom')
const inputTo = document.getElementById('inputTo')

async function getCur(){
    const res = await fetch('https://api.monobank.ua/bank/currency');
    let data = await res.json();
    console.log({data});

    let options = data.map(item => {
        return  `<option value="${item.currencyCodeA}">${item.rateCross}</option>`;
    });
    
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