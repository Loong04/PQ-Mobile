(() => {
  const records = Object.freeze([
    Object.freeze({ name: 'ERNEST TAN', identity: '123', gender: 'Male', nationality: '', qualification: 'UPPER SECONDARY', mobile: '213', email: 'ad@ad.con' }),
    Object.freeze({ name: 'TAN SIOW WEI', identity: '858542719340', gender: 'Male', nationality: 'INDONESIAN', qualification: 'DIPLOMA', mobile: '012345687', email: 'johnrichard_111@gmail.com' }),
    Object.freeze({ name: 'GAN THIAM POH', identity: '858542676932', gender: 'Male', nationality: 'CHINESE', qualification: 'DIPLOMA', mobile: '012345687', email: 'johnrichard_649@gmail.com' }),
    Object.freeze({ name: 'Edward S.S', identity: '87527898273', gender: 'Male', nationality: 'MALAYSIAN', qualification: 'DEGREE', mobile: '0123391576', email: 'eds@gmail.com' }),
    Object.freeze({ name: 'Jake Tan', identity: '7483737373', gender: 'Male', nationality: 'CHINESE', qualification: 'DEGREE', mobile: '0182336112', email: 'jaketan@pq.com.my' }),
    Object.freeze({ name: 'NUR AINA BINTI YUSOF', identity: '900412105544', gender: 'Female', nationality: 'MALAYSIAN', qualification: 'DEGREE', mobile: '0126784451', email: 'aina.yusof@pq.com.my' }),
    Object.freeze({ name: 'LIM WEI JIAN', identity: '920728085167', gender: 'Male', nationality: 'MALAYSIAN', qualification: 'DIPLOMA', mobile: '0163349852', email: 'weijian.lim@pq.com.my' }),
    Object.freeze({ name: 'SITI NURFARAH', identity: '950309145863', gender: 'Female', nationality: 'MALAYSIAN', qualification: 'CERTIFICATE', mobile: '0172886403', email: 'sitifarrah@pq.com.my' }),
    Object.freeze({ name: 'MOHD AZLAN BIN RASHID', identity: '880615016392', gender: 'Male', nationality: 'MALAYSIAN', qualification: 'UPPER SECONDARY', mobile: '0195564178', email: 'azlan.rashid@pq.com.my' }),
    Object.freeze({ name: 'KOH YI XIN', identity: '970921085420', gender: 'Female', nationality: 'MALAYSIAN', qualification: 'DEGREE', mobile: '0149023561', email: 'yixin.koh@pq.com.my' }),
    Object.freeze({ name: 'RAJESH KUMAR', identity: '890115076528', gender: 'Male', nationality: 'MALAYSIAN', qualification: 'DIPLOMA', mobile: '0113562789', email: 'rajesh.kumar@pq.com.my' }),
    Object.freeze({ name: 'NURUL IZZATI', identity: '990430115796', gender: 'Female', nationality: 'MALAYSIAN', qualification: 'DEGREE', mobile: '0187219430', email: 'nurul.izzati@pq.com.my' }),
    Object.freeze({ name: 'ONG KAH MUN', identity: '930804086711', gender: 'Female', nationality: 'MALAYSIAN', qualification: 'DIPLOMA', mobile: '0124896157', email: 'kahmun.ong@pq.com.my' })
  ]);

  const profiles = Object.freeze(records.map((record, index) => Object.freeze({
    ...record,
    alias: index === 1 ? 'johndoe' : '',
    birthDate: index === 1 ? '1992-07-27' : '',
    race: index === 1 ? 'CHINESE' : '',
    religion: index === 1 ? 'HINDUISM' : '',
    paymentMode: '',
    bank: '',
    bankAccount: '',
    epf: '',
    incomeTax: '',
    maritalStatus: index === 1 ? 'Single' : '',
    hireDate: index === 1 ? '2026-10-06' : '',
    basicPay: index === 1 ? '0' : '',
    company: '',
    branch: '',
    department: '',
    jobType: '',
    jobPosition: '',
    reportingGroup: '',
    supervisor: '',
    shiftGroup: '',
    probationMonths: index === 1 ? '0' : '',
    probationDays: index === 1 ? '0' : '',
    address1: index === 1 ? '11 Street' : '',
    address2: index === 1 ? 'PJ Square' : '',
    address3: index === 1 ? 'Petaling Jaya' : '',
    postCode: index === 1 ? '47301' : '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyAddress1: '',
    emergencyAddress2: '',
    emergencyAddress3: '',
    emergencyPostCode: '',
    attachments: Object.freeze([])
  })));

  window.confirmNewUserRecords = records;
  window.confirmNewUserProfiles = profiles;
})();
