const fs = require('node:fs');
const path = require('node:path');
const out = path.join(__dirname, 'leave-baseline-audit-20261012');
const focused = JSON.parse(fs.readFileSync(path.join(out, 'focused-observations.json'), 'utf8'));
const pages = JSON.parse(fs.readFileSync(path.join(out, 'page-observations.json'), 'utf8'));
const rows = focused.filter(row => /Form |Status |history filter|history detail|Approval filter|No status|Career .*detail|highlight detail|New User|pending approval/.test(row.name) || /viewApplyLeaveForm|viewCreditLeaveForm|viewApplyOffTimeForm|viewMyLeaveHistory/.test(row.name)).map(row => {
  const v = row.variants?.find(v => v.width === 360 && v.theme === 'dark');
  return {index:row.index,name:row.name,file:row.file,error:row.error,
    phone:v?.phone?.[0] && {y:v.phone[0].y,width:v.phone[0].width,height:v.phone[0].height,radius:v.phone[0].radius},
    headings:v?.headings.filter(x=>x.visible).map(x=>[x.text,x.fontSize,x.weight]),
    fields:v?.fields.filter(x=>x.visible).slice(0,4).map(x=>[x.label,x.fontSize,x.weight,x.radius,x.padding]),
    cards:v?.cards.filter(x=>x.visible).slice(0,2).map(x=>[x.cls,x.radius,x.padding,x.chevron]),
    status:v?.extra.status?.slice(0,1),
    details:v?.extra.details,
    metrics:v?.extra.metrics};
});
fs.writeFileSync(path.join(out,'component-summary.json'),JSON.stringify(rows,null,2));
if(process.argv.includes('--print')) console.log(JSON.stringify(rows,null,2));
else console.log(JSON.stringify({pageCount:pages.length,focusCases:focused.length,states:focused.reduce((n,x)=>n+(x.variants?.length||0),0),errors:focused.filter(x=>x.error||x.errors?.length).map(x=>({case:x.name,error:x.error,errors:x.errors})),summary:path.join(out,'component-summary.json')},null,2));
