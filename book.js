const puppeteer = require('puppeteer');
const axios = require('axios');
const FormData = require('form-data');
const moment = require('moment');
const crontab = require('node-crontab');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "joshuasaputra77@gmail.com",
      pass: "oykp hiny eoli xhvj ",
    },
  });

let setting = null;
let cookies = null;
// const setup = { executablePath: '/usr/bin/chromium-browser' };

const setup = undefined;

const constant = {
    BADMINTON_1: '563',
    BADMINTON_2: '564'
}

const account = [
    {
        id: 11,
        email: 'joshuasaputra77@gmail.com',
        password: 'O81zVNXQ',
        name: 'Joshua',
        mobile: '0176603455',
        unit: '1-47985'
    },
    {
        id: 12,
        email: 'Tjhaigunawan168@gmail.com',
        password: '3FYckCVZ',
        name: 'Gunawan',
        mobile: '0172650369',
        unit: '1-47985'
    },
    {
        id: 13,
        email: 'Andrian.k90@gmail.com',
        password: 'Gprop888',
        name: 'Andrian',
        mobile: '01154122718',
        unit: '1-47758'
    },
    {
        id: 14,
        email: 'carissagatha@gmail.com',
        password: 'cZXlo0iY',
        name: 'Carissa',
        mobile: '01154122718',
        unit: '1-47758'
    }
];

const daySetting = [
    {
        id: 1,
        useId: 11,
        court: constant.BADMINTON_1
    },
    {
        id: 2,
        useId: 11,
        court: constant.BADMINTON_2
    },
    {
        id: 3,
        useId: 12,
        court: constant.BADMINTON_1
    },
    {
        id: 4,
        useId: 12,
        court: constant.BADMINTON_2
    },
    {
        id: 5,
        useId: 13,
        court: constant.BADMINTON_1
    },
    {
        id: 6,
        useId: 13,
        court: constant.BADMINTON_2
    },
    {
        id: 7,
        useId: 14,
        court: constant.BADMINTON_1
    },
    {
        id: 8,
        useId: 14,
        court: constant.BADMINTON_2
    }
]

const timeSetting = [
    {
        dayOfWeek: 0,
        time: '{"name":"bookingTime","value":"19:00-20:00"},{"name":"bookingTime","value": "20:00-21:00"}'
    },
    {
        dayOfWeek: 1,
        time: '{"name":"bookingTime","value":"20:00-21:00"},{"name":"bookingTime","value": "21:00-22:00"}'
    },
    {
        dayOfWeek: 2,
        time: '{"name":"bookingTime","value":"20:00-21:00"},{"name":"bookingTime","value": "21:00-22:00"}'
    },
    {
        dayOfWeek: 3,
        time: '{"name":"bookingTime","value":"20:00-21:00"},{"name":"bookingTime","value": "21:00-22:00"}'
    },
    {
        dayOfWeek: 4,
        time: '{"name":"bookingTime","value":"20:00-21:00"},{"name":"bookingTime","value": "21:00-22:00"}'
    },
    {
        dayOfWeek: 5,
        time: '{"name":"bookingTime","value":"20:00-21:00"},{"name":"bookingTime","value": "21:00-22:00"}'
    },
    {
        dayOfWeek: 6,
        time: '{"name":"bookingTime","value":"20:00-21:00"},{"name":"bookingTime","value": "21:00-22:00"}'
    },

]

const getCurrentCookies = async ({
    useId
}) => {
    const {
        email,
        password
    } = account.find(val => val.id === useId)
  const browser = await puppeteer.launch(setup);
  const page = await browser.newPage();
  page.setDefaultTimeout(9999999);

  await page.goto('https://www.gpropsystems.com/login');
  await page.setViewport({width: 1080, height: 1024});
  await page.type('#email', email);
  await page.type('#password', password);

  await page.click('#login');

  await page.goto('https://www.gpropsystems.com/booking/add_new_booking');

  const cookies = await page.cookies();

  await browser.close();

  return cookies;
}

const getScreenshot = async({ email, password, bookingCode}) => {
    const browser = await puppeteer.launch(setup);
    const page = await browser.newPage();
    const m = puppeteer.KnownDevices['iPhone 11 Pro Max']
    await page.emulate(m);
    page.setDefaultTimeout(9999999);
  
    await page.goto('https://www.gpropsystems.com/login');
    
    await page.type('#email', email);
    await page.type('#password', password);
  
    await page.click('#login');
  
    await page.goto(`https://www.gpropsystems.com/booking/view_details/${bookingCode}`);

    await page.screenshot({ path: `./SS.jpg` });
  
    await browser.close();
  
    return '';
    
};

const formatCookie = (cookies) => {
    let result = '';
    cookies.forEach((val, idx) => {
        if(idx === 0){
            result = `${val.name}=${val.value}`;
        }
        else {
            result += `;${val.name}=${val.value}`;
        }
    });
    return result;
};

const getSpecialCookieValue = (cookies) => {
    return cookies.filter((val) => {
        return val.name !== 'ci_session' && val.name !== 'user'
    })[0].value;
}

const bookCourt = async (bookingDate, {
    court,
    useId
}, dayOfWeek) => {
    const {
        email,
        password,
        name,
        mobile,
        unit
    } = account.find(val => val.id === useId)
    const bookingTime = timeSetting.find(val => val.dayOfWeek === dayOfWeek).time
    console.log('Booking...')
    try{
        const form = new FormData();
        form.append('is_ajax', 1);
        form.append('otherData', `[{"name":"fldFacilityId","value":"${court}"},{"name":"fldUnitId","value":"${unit}"},{"name":"fldName","value":"${name}"},{"name":"fldContact","value":"${mobile}"},{"name":"fldBookingDate","value": "${bookingDate}"},${bookingTime},{"name":"_co6sO0rpsfat","value": "${getSpecialCookieValue(cookies)}"}]
        `);
        form.append('_co6sO0rpsfat', getSpecialCookieValue(cookies));
        form.append('fileCount', 0);
        const response = await axios.post('https://www.gpropsystems.com/booking/add_new_booking_action', form ,{
            headers: {
                cookie: formatCookie(cookies)
            }
        })
        if(response?.data?.insertID){
            await getScreenshot({
                email,
                password,
                bookingCode: response.data.insertID
            });
        }
        return {
            msg: response.data.msg,
            code: response.data.insertID
        }
    }
    catch(err) {
        console.log(err.message);
    }
};

(async () => {
    let usedAccount = [
        {
            id: 8,
            useId: 14,
            court: constant.BADMINTON_2,
            bookingDate: '2024-07-16'
        },
        {
            id: 7,
            useId: 14,
            court: constant.BADMINTON_1,
            bookingDate: '2024-07-13'
        },
        {
            id: 6,
            useId: 13,
            court: constant.BADMINTON_2,
            bookingDate: '2024-07-14'
        },
        {
            id: 2,
            useId: 11,
            court: constant.BADMINTON_2,
            bookingDate: '2024-07-15'
        },
    ];
    let freeAccount = [
        {
            id: 5,
            useId: 13,
            court: constant.BADMINTON_1
        },
        {
            id: 1,
            useId: 11,
            court: constant.BADMINTON_1
        },
        
        {
            id: 3,
            useId: 12,
            court: constant.BADMINTON_1
        },
        {
            id: 4,
            useId: 12,
            court: constant.BADMINTON_2
        }
    ];

    const getCookie = async () => {
        const today = moment().utcOffset('+0800').add(120, 'seconds');
        const nextWeek = moment().utcOffset('+0800').add(7, 'days').add(120, 'seconds');
        console.log(nextWeek.format('MMMM Do YYYY, h:mm:ss a'));
        const bookingDate = nextWeek.format('YYYY-MM-DD');

        // Push expired account to Free account
        let expiredAccount = usedAccount.filter(val => {
            return today.isAfter(val.bookingDate, 'day');
        });
        expiredAccount.forEach(val => {
            delete val.bookingDate;
            freeAccount.push(val);
        });
        // Remove yesterday booking account from used account
        usedAccount = usedAccount.filter(val => {
            return val.bookingDate;
        });

        if(freeAccount.length > 0){
            setting = freeAccount[0];
        } else {
            setting = null;
            console.log('No Account that is currently Free');
        }

        if(setting){
            console.log(`Booking Court at ${bookingDate}`);
            console.log(`Court: ${setting.court}`);
            console.log(`Using ${account.find(val => val.id === setting.useId).name} Account`);
            console.log('');

            console.log(`Login Start: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);
            cookies = await getCurrentCookies(setting);
            console.log(`Login Finish: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);
        }
    };
    
    const getBook = async () => {
        const nextWeek = moment().utcOffset('+0800').add(7, 'days').add(120, 'seconds');
        const dayOfWeek = nextWeek.day()
        const bookingDate = nextWeek.format('YYYY-MM-DD');

        console.log(dayOfWeek);

        console.log(`Booking Start: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);
        const response = await bookCourt(bookingDate, setting, dayOfWeek);
        console.log(`Booking Finished: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);

        console.log(response.msg);

        if(response.msg === 'Your booking has been submitted.'){
            // Put account inside usedAccount
            usedAccount.push({
                ...setting,
                bookingDate
            });

            // Remove from free account
            freeAccount = freeAccount.filter(val => {
                return val.id !== setting.id;
            });

            const mailOptions = {
                from: "Asteria Booking Master",
                to: "joshuaytube88@gmail.com;Tjhaigunawan168@gmail.com;Andrian.k90@gmail.com;carissagatha@gmail.com",
                subject: "Book Status",
                text: `Using ${account.find(val => val.id === setting.useId).name} Account, Book Court ${setting.court}, Success, Booking code: BK${response.code}`,
                attachments: [{
                    filename: 'Booking.jpg',
                    path: __dirname + '/SS.jpg',
                    cid: 'myImg'
                  }]
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending email: ", error);
                } else {
                    console.log("Email sent: ", info.response);
                }
            });
        }else{
            const mailOptions = {
                from: "joshuasaputra77@gmail.com",
                to: "joshuaytube88@gmail.com;Tjhaigunawan168@gmail.com;Andrian.k90@gmail.com;carissagatha@gmail.com",
                subject: "Book Status",
                text: `Booking Failed`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending email: ", error);
                } else {
                    console.log("Email sent: ", info.response);
                }
            });
        }

        console.log('======================');
        console.log('Current Used Account: ');
        console.log('======================');
        usedAccount.forEach(val => {
            console.log(`Account: ${account.find(acc => acc.id === val.useId).name}`);
            console.log(`Court: ${val.court}`);
            console.log(`Booking Date: ${val.bookingDate}`);
            console.log('--')
        });
        console.log('======================');
        console.log('Current Free Account: ');
        console.log('======================');
        freeAccount.forEach(val => {
            console.log(`Account: ${account.find(acc => acc.id === val.useId).name}`);
            console.log(`Court: ${val.court}`);
            console.log('--')
        });
        console.log('===========================================================================')
    };
    // getCookie();
    crontab.scheduleJob("55 58 15 * * *", getCookie);
    crontab.scheduleJob("01 00 16 * * *", getBook);
    
})();