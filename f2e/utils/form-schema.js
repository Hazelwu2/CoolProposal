import * as yup from 'yup';

const errorMsg = {
  required: '此欄位不可為空',
  email: 'Email 格式無效',
  name: (num) => (`酷提案至少 ${num} 字以上`),
  description: (num) => (`提案描述至少 ${num} 字以上`),
  imageUrl: '非有效網址',
  amount: '不可是負數',
  checkAmount: '目標金額必須 > 最小募資金額'
}

// [建立提案] 表單
export const NewProposalSchema = yup.object().shape({
  name: yup.string()
    .required(errorMsg.required)
    .min(2, errorMsg.name(2)),

  // 酷提案的描述
  description: yup.string()
    .required(errorMsg.required)
    .min(6, errorMsg.description(6)),

  // 提案封面照
  imageUrl: yup.string()
    .required(errorMsg.required)
    .url(errorMsg.imageUrl)
    .nullable(),

  // 目標金額
  target: yup.string()
    .nullable(errorMsg.required)
    .required(errorMsg.required),
  // .moreThan(yup.ref('minAmount'), errorMsg.checkAmount),


  // 最小募資金額
  minAmount: yup.string()
    .nullable(errorMsg.required)
    .required(errorMsg.required),
  // .lessThan(yup.ref('target'), errorMsg.checkAmount)
  // .when('target', (target, schema) => {
  //   return schema.test({
  //     test: (minAmount) => {
  //       console.log('minAmount', minAmount, target)
  //       if (minAmount > parseFloat(target)) {
  //         return false
  //       } else {
  //         return true
  //       }
  //     },
  //     message: '目標金額必須 > 最小募資金額'
  //   })
  // })

  // 募資截止日期
  deadline: yup.date()
    .nullable(errorMsg.required)
    .required(errorMsg.required)
});

// const proposal = {
//   name: 'Co',
//   description: '',
//   imageUrl: 'https://www.google.com',
//   target: '-1',
//   minAmount: '-1'
// }
// NewProposalSchema
//   .validate(proposal, { strict: true })
//   .then(value => console.log(value))
//   .catch(error => console.log(123123, error))