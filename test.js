
// x1 = true
// x2 = true
// x3 = false

// const one = () => {
//     return new Promise((resolve, reject) => {
//         if (x1) {
//             resolve('resolve one')
//         } else {
//             reject('reject one')
//         }
//     })
// }

// const two = () => {
//     return new Promise((resolve, reject) => {
//         if (x2) {
//             resolve('resolve two')
//         } else {
//             reject('reject two')
//         }
//     })
// }
// const three = () => {
//     return new Promise((resolve, reject) => {
//         if (x3) {
//             resolve('resolve three')
//         } else {
//             reject('reject three')
//         }
//     })
// }

// async function test() {
//     var temp = await one()
//         .then((ret) => {
//             console.log(ret)
//             return two()
//         })
//         .then((ret) => {
//             console.log(ret)
//             return three()
//         })
//         .then((ret) => {
//             console.log(ret)
//             return 'hello'
//         })
//         .catch((ret) => {
//             console.log(ret)
//             return 'nop'
//         })

//     console.log(temp)
// }

// test()


// const invalidInputs = new Array()
// if (invalidInputs) {
//     console.log(invalidInputs)
// }

// var gg = ''
// xx = gg.split(',')
// console.log(xx)
// gg = gg.split(',').filter(Boolean)
// console.log(gg)
// if (gg) {
//     console.log('object')
// }

// let temp = 'hel-lo cs-2 1'
// temp = temp.replaceAll(/[\s-]/g, '')
// console.log(temp)

// let newEvents = new Object
// let subj = 'math'
// let a = 'a'

// newEvents[subj] = newEvents[subj].concat([a])
// console.log(newEvents)

var test = [1, 2, 3, 4, 3]
console.log(test.lastIndexOf(6))