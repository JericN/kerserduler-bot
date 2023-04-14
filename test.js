
const arrayTest = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

console.log(arrayTest);
arrayFunction({ arrayX: arrayTest });
console.log(arrayTest);


function arrayFunction({ arrayX }) {
    for (let i = 0; i < 10; i++) {
        arrayX[i] = 0;
    }
    return arrayX;
}