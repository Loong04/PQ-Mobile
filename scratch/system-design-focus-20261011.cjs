const fs=require('node:fs/promises');
const path=require('node:path');
const http=require('node:http');
const puppeteer=require('puppeteer');
const {inspect,root,out}=require('./system-design-audit-20261011.cjs');
const {cases:detailCases}=require('./capture_detail_dialog_audit.cjs');
const cases=[];
const add=(name,file,code='',shot=false)=>cases.push({name,file,code,shot});
for(const view of ['viewLeaveHub','viewApplyLeave','viewApplyLeaveForm','viewLeaveCredit','viewCreditLeaveForm','viewApplyOffTimeForm','viewMyPersonalCalendar','viewMyLeaveHistory','viewLeaveCalendar','viewLeaveHighlight','viewLeaveHighlightChart','viewLeaveHighlightTrend','viewLeaveHighlightAnalysis','viewStaffEntitlement','viewTeamApprovals'])add('Leave '+view,'leave.html',`showLeaveSection('${view}');`,['viewApplyLeaveForm','viewMyLeaveHistory','viewLeaveHighlight','viewStaffEntitlement'].includes(view));
add('Leave history filter','leave.html',"showLeaveSection('viewMyLeaveHistory');openHistoryFilterModal();",true);
add('Leave highlight filter','leave.html',"showLeaveSection('viewLeaveHighlight');openHighlightFilterModal();",true);
add('Leave highlight detail','leave.html',"showLeaveSection('viewLeaveHighlight');document.querySelector('#viewLeaveHighlight [onclick*=openLeaveHighlightDetailsModal]').click();",true);
add('Benefit highlight detail','modules/claims/options/benefit-highlight.html',"openBenefitDetailsModal('#EBB01','Sarah Jenkins');",true);
add('Expense highlight detail','modules/claims/options/expenses-highlight.html',"openExpenseDetailsModal('#004177','Marcus Tan');",true);
for(const job of detailCases)add(job.group+' '+job.name,job.file,job.file.endsWith('/feedback-history.html')?"document.querySelector('.pending-feedback-details-trigger').click();":job.code.replace(/viewMyHistory/g,'viewMyLeaveHistory'),['leave','benefit','Clocking','Timesheet','Tax Relief','Prior Pay Data','hours-summary.html'].includes(job.name));
for(const file of ['modules/claims/options/advance-claim.html','modules/claims/options/ot-claim.html','modules/claims/options/submit-claim.html','modules/payroll/options/tax-relief-request.html','modules/project-task/options/work-plan.html','modules/employee-career/options/individual/feedback.html','modules/employee-career/options/team/confirm-staff.html','modules/admin/options/guest-visit.html','modules/admin/options/letter-request.html','change-request.html'])add('Form '+file,file,'',true);
for(const file of ['modules/attendance/index.html','modules/claims/index.html','modules/payroll/index.html','modules/project-task/index.html','modules/employee-career/index.html','modules/admin/index.html'])add('Status '+file,file,'',true);
for(const file of ['modules/claims/options/benefit-highlight.html','modules/claims/options/expenses-highlight.html','modules/claims/options/staff-entitlement.html','modules/attendance/options/attendance-highlight.html','modules/attendance/options/clocking-summary.html','modules/attendance/options/hours-costing.html','modules/attendance/options/overtime-costing.html','modules/project-task/options/timesheet-highlight.html','modules/admin/options/asset-highlight.html','modules/employee-career/options/team/staff-list.html','modules/employee-career/options/team/staff-attrition.html','modules/employee-career/options/team/manpower-stats.html'])add('Report '+file,file,'',true);
for(const file of ['modules/admin/options/history.html','modules/employee-career/options/history.html']){
  add('Current history detail '+file,file,file.includes('/admin/')?"document.querySelector('.history-card-main').click();":"document.querySelector('.history-card-item').click();",true);
  add('Current history filter '+file,file,"document.getElementById('historyFilterTrigger').click();",false);
}
add('Career whereabout detail','modules/employee-career/options/team/staff-whereabout.html',"document.querySelector('.staff-whereabout-card').click();",true);
add('Career staff feedback detail','modules/employee-career/options/team/staff-feedback.html',"document.querySelector('.staff-feedback-card').click();",true);
add('Shift work summary','modules/attendance/options/shift-plan.html',"document.querySelectorAll('button').forEach(x=>{if(x.textContent.trim()==='Work Shift Summary')x.click();});",true);
const pageRows=require('./system-design-audit-20261011/page-observations.json');
for(const row of pageRows.filter(x=>x.variants?.[0]?.charts.some(y=>y.visible)&&x.file!=='leave.html'))add('Chart '+row.file,row.file,"const button=[...document.querySelectorAll('button,a,[onclick]')].find(x=>x.getClientRects().length&&x.textContent.trim()==='View Chart');if(!button)throw new Error('No visible chart trigger');button.click();",true);
add('Chart Leave','leave.html',"showLeaveSection('viewLeaveHighlightChart');",true);
add('Chart Claims team','modules/claims/index.html',"window.ClaimsEngine.switchClaimScope('team');window.ClaimsEngine.openChartBreakdownSheet('team');",true);
add('Chart Career team','modules/employee-career/index.html',"document.getElementById('employeeCareerTabTeam').click();document.querySelector('.employee-career-event-chart').click();",true);
add('Chart Staff hours staff','modules/attendance/options/staff-hours-summary.html',"openListDetails('Normal Work Hours');openChart('staff');",true);
add('Chart Staff hours daily','modules/attendance/options/staff-hours-summary.html',"openListDetails('Normal Work Hours');openStaffDailyDetails(0);openChart('daily');",true);
add('Details Staff hours','modules/attendance/options/staff-hours-summary.html',"openListDetails('Normal Work Hours');openStaffDailyDetails(0);openAttendanceDetailsByIndex(0);",true);
for(const [file,code]of[
  ['modules/admin/options/pending-approval.html',"document.getElementById('workplacePendingFilterTrigger').click();"],
  ['modules/employee-career/options/pending-approval.html',"document.getElementById('careerPendingFilterTrigger').click();"],
  ['modules/payroll/options/pending-approval.html',"document.getElementById('payrollPendingFilterTrigger').click();"],
  ['modules/claims/options/pending-approval.html',"window.ClaimsEngine.openPendingApprovalFilter();"]])add('Approval filter '+file,file,code,true);
for(const view of ['view-work-shift-summary','view-no-work-summary','view-ot-plan-summary','view-leave-summary'])add('No status '+view,'modules/attendance/options/shift-plan.html',`openSummaryViewFromCal('${view}');`,true);
add('Medical form','modules/claims/options/medical-claim.html',"openMedicalClaimForm();",true);
add('Benefit form','modules/claims/options/benefit-claim.html',"document.querySelector('.claim-option-action').click();",true);
add('Benefit entitlement cards','modules/claims/options/staff-entitlement.html','',true);
add('Claims history filter','modules/claims/options/history.html',"openDateFilterModal();",true);
add('Payroll history filter','modules/payroll/options/history.html',"document.getElementById('historyFilterTrigger').click();",true);
add('Daily OT records','modules/attendance/options/daily-ot.html','',true);
for(const index of [1,5,6,58,59,96,98])cases[index-1].shot=true;
async function main(){
  const server=http.createServer(async(req,res)=>{try{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}const data=await fs.readFile(file);const type={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'}[path.extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type}).end(data);}catch{res.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
  const only=process.argv.find(x=>x.startsWith('--only='))?.slice(7).split(',').map(Number);
  let cursor=process.argv.includes('--extra')?101:0;const results=only?JSON.parse(await fs.readFile(path.join(out,'focused-observations.json'),'utf8')).filter(x=>!only.includes(x.index)):cursor?JSON.parse(await fs.readFile(path.join(out,'focused-observations.json'),'utf8')).filter(x=>x.index<=101):[];
  try{
    await Promise.all(Array.from({length:3},async()=>{
      const context=await browser.createBrowserContext(),page=await context.newPage();
      page.on('dialog',dialog=>dialog.dismiss());
      await page.setRequestInterception(true);
      page.on('request',req=>req.url().startsWith(base)||/^(data:|blob:|about:)/.test(req.url())||/fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com/.test(req.url())?req.continue():req.abort());
      let errors=[];page.on('pageerror',error=>errors.push(error.message));
      while(cursor<cases.length){
        const index=cursor++,job=cases[index],row={index:index+1,...job};errors=[];
        if(only&&!only.includes(index+1))continue;
        try{
          await page.setViewport({width:390,height:844});
          await page.goto(base+'/'+job.file+(job.file.includes('?')?'&':'?')+'theme=dark',{waitUntil:'domcontentloaded',timeout:15000});
          await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,2000))]));
          await page.addStyleTag({content:'*,*::before,*::after{transition:none!important;animation-duration:0s!important;animation-delay:0s!important;}'});
          await new Promise(resolve=>setTimeout(resolve,180));
          if(job.code)await page.evaluate(code=>(0,eval)(code),job.code);
          await new Promise(resolve=>setTimeout(resolve,160));
          row.variants=[];
          for(const width of [360,420])for(const theme of ['dark','light']){
            await page.setViewport({width,height:844});
            await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
            await new Promise(resolve=>setTimeout(resolve,35));
            const data=await page.evaluate(inspect);
            data.extra=await page.evaluate(()=>{
              const clean=x=>String(x||'').replace(/\s+/g,' ').trim(),visible=x=>!!x.getClientRects().length&&getComputedStyle(x).visibility!=='hidden';
              const take=x=>{const s=getComputedStyle(x);return {text:clean(x.textContent).slice(0,140),cls:x.className,id:x.id,font:s.fontSize,weight:s.fontWeight,color:s.color,radius:s.borderRadius,padding:s.padding,border:s.border,background:s.backgroundColor,image:s.backgroundImage,height:x.getBoundingClientRect().height};};
              return {fontLoaded:document.fonts.check('700 13px "Plus Jakarta Sans"'),iconLoaded:document.fonts.check('900 13px "Font Awesome 6 Free"'),metrics:[...document.querySelectorAll('.entitlement-metric-value')].filter(visible).slice(0,12).map(x=>({text:clean(x.textContent),width:x.clientWidth,scrollWidth:x.scrollWidth})),headings:[...document.querySelectorAll('.main-content h2,.main-content h3')].filter(visible).map(take),status:[...document.querySelectorAll('.work-status-card,.workplace-status-card,.employee-career-status-card,.project-dashboard-status-card,.stat-mini,.request-metric')].filter(visible).map(x=>({...take(x),children:[...x.children].map(take)})),details:[...document.querySelectorAll('.detail-popout-panel,.history-details-dialog,.benefit-details-dialog,.expense-details-dialog,.leave-highlight-details-dialog,[role=dialog],dialog')].filter(visible).map(x=>({...take(x),header:x.querySelector('.detail-popout-header,h2,h3')?take(x.querySelector('.detail-popout-header,h2,h3')):null})),tableHeaders:[...document.querySelectorAll('th')].filter(visible).slice(0,10).map(take)};
            });
            row.variants.push({width,theme,...data});
          }
          if(job.shot){
            row.screenshots=[];
            for(const theme of ['dark','light']){
              await page.setViewport({width:390,height:844});
              await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
              await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
              const file=String(index+1).padStart(3,'0')+'-'+theme+'.png';
              await page.screenshot({path:path.join(out,file)});row.screenshots.push(file);
            }
          }
        }catch(error){row.error=error.message;}
        row.errors=[...errors];results.push(row);
        if(results.length%12===0)console.log('Inspected '+results.length+'/'+cases.length+' section, form, detail and report cases');
      }
      await context.close();
    }));
    results.sort((a,b)=>a.index-b.index);
    await fs.writeFile(path.join(out,'focused-observations.json'),JSON.stringify(results,null,2));
    console.log(JSON.stringify({cases:results.length,variants:results.reduce((n,x)=>n+(x.variants?.length||0),0),screenshots:results.reduce((n,x)=>n+(x.screenshots?.length||0),0),failures:results.filter(x=>x.error||x.errors.length).map(x=>({index:x.index,name:x.name,error:x.error,errors:x.errors})),fontChecks:results.filter(x=>x.variants?.some(y=>!y.extra.fontLoaded||!y.extra.iconLoaded)).map(x=>x.name)},null,2));
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
