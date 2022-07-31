/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!***************************!*\
  !*** ./src/index_mono.js ***!
  \***************************/
const selectFrom = document.getElementById('selectFrom');
const selectTo = document.getElementById('selectTo');
const inputFrom = document.getElementById('inputFrom')
const inputTo = document.getElementById('inputTo')

async function getCur(){
    const res = await fetch('https://api.monobank.ua/bank/currency');
    let data = await res.json();
    console.log({data});

    let options = data.map(item => {
        if (eiuh) {
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
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsS0FBSztBQUN0QjtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsbUJBQW1CLElBQUksYUFBYTtBQUN0RSxVQUFVO0FBQ1Ysc0NBQXNDLG1CQUFtQixJQUFJLGVBQWU7QUFDNUU7QUFDQSxLQUFLO0FBQ0wsaUJBQWlCLFFBQVE7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vb25saW5lX2NvbnZlcnRlci8uL3NyYy9pbmRleF9tb25vLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNlbGVjdEZyb20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VsZWN0RnJvbScpO1xyXG5jb25zdCBzZWxlY3RUbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWxlY3RUbycpO1xyXG5jb25zdCBpbnB1dEZyb20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXRGcm9tJylcclxuY29uc3QgaW5wdXRUbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dFRvJylcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEN1cigpe1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLm1vbm9iYW5rLnVhL2JhbmsvY3VycmVuY3knKTtcclxuICAgIGxldCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTtcclxuICAgIGNvbnNvbGUubG9nKHtkYXRhfSk7XHJcblxyXG4gICAgbGV0IG9wdGlvbnMgPSBkYXRhLm1hcChpdGVtID0+IHtcclxuICAgICAgICBpZiAoZWl1aCkge1xyXG4gICAgICAgIHJldHVybiAgYDxvcHRpb24gdmFsdWU9XCIke2l0ZW0uY3VycmVuY3lDb2RlQX1cIj4ke2l0ZW0ucmF0ZUJ1eX08L29wdGlvbj5gO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAgYDxvcHRpb24gdmFsdWU9XCIke2l0ZW0uY3VycmVuY3lDb2RlQX1cIj4ke2l0ZW0ucmF0ZUNyb3NzfTwvb3B0aW9uPmA7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjb25zb2xlLmxvZyh7b3B0aW9uc30pO1xyXG4gICAgXHJcbiAgICBzZWxlY3RGcm9tLmlubmVySFRNTCA9IG9wdGlvbnMuam9pbihcIlxcblwiKTtcclxuICAgIHNlbGVjdFRvLmlubmVySFRNTCA9IG9wdGlvbnMuam9pbihcIlxcblwiKTtcclxuXHJcbiAgICBpbnB1dEZyb20uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4gY29udmVydChkYXRhKSk7XHJcbiAgICBzZWxlY3RGcm9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IGNvbnZlcnQoZGF0YSkpO1xyXG4gICAgc2VsZWN0VG8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4gY29udmVydChkYXRhKSk7XHJcblxyXG59O1xyXG5cclxuZ2V0Q3VyKCk7XHJcblxyXG5mdW5jdGlvbiBjb252ZXJ0KGRhdGEpIHtcclxuICAgIGxldCBzZWxlY3RGcm9tVmFsdWUgPSBkYXRhLmZpbmQoKGVsZW1lbnQpID0+IHtcclxuICAgICAgICByZXR1cm4gKGVsZW1lbnQuY3VycmVuY3lDb2RlQSA9PSBzZWxlY3RGcm9tLnZhbHVlKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGxldCBzZWxlY3RUb1ZhbHVlID0gZGF0YS5maW5kKChlbGVtZW50KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIChlbGVtZW50LmN1cnJlbmN5Q29kZUEgPT0gc2VsZWN0VG8udmFsdWUpXHJcbiAgICB9KTtcclxuICAgIGxldCBjcm9zc0N1ciA9IHNlbGVjdEZyb21WYWx1ZS5yYXRlQnV5IC8gc2VsZWN0VG9WYWx1ZS5yYXRlQnV5O1xyXG4gICAgaW5wdXRUby52YWx1ZSA9IChjcm9zc0N1ciAqIGlucHV0RnJvbS52YWx1ZSkudG9GaXhlZCgyKTtcclxuXHJcbn07Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9