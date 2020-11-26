import React from 'react';
import shortid from 'shortid';
import '../../app.css';

export default function Signup() {
  function allowedYears() {
    const listOfYears = [];

    const curYear = new Date();
    const minimumAge = 16;
    const maxAge = 100;

    const lastYear = curYear.getFullYear() - minimumAge;
    const beginningYear = curYear.getFullYear() - maxAge;

    for (let year = beginningYear; year < lastYear; year += 1) {
      listOfYears.push(
        <option key={shortid.generate()} value={year}>
          {' '}
          {year}
          {' '}
        </option>
      );
    }

    return listOfYears;
  }

  function getMonthOptions() {
    const listOfMonths = [];
    const monthStrings = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dev'];

    for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
      listOfMonths.push(
        <option key={shortid.generate()} value={monthIndex + 1}>
          {' '}
          {monthStrings[monthIndex]}
          {' '}
        </option>
      );
    }

    return listOfMonths;
  }

  function getDaysOptions() {
    const listOfDays = [];

    for (let dayIndex = 1; dayIndex <= 31; dayIndex += 1) {
      listOfDays.push(<option key={shortid.generate()} value={dayIndex}>{dayIndex}</option>);
    }

    return listOfDays;
  }

  return (
    <div className="container">
      <div className="row">
        <h2 className="offset-sm-3 col-sm-6 signup">Signup</h2>
      </div>
      <div className="row">
        <div className="offset-sm-1 col-sm-2" />
        <div className="col-sm-6">
          <form action="/LS_API/signup" method="post" acceptCharset="utf-8" className="form">
            <div className="row">
              <div className="col-xs-6 col-md-6">
                <input type="text" name="firstname" className="form-control input-lg" id="firstname" placeholder="First Name" />
                {' '}

              </div>
              <div className="col-xs-6 col-md-6">
                <input type="text" name="lastname" className="form-control input-lg" id="lastname" placeholder="Last Name" />
                {' '}

              </div>
            </div>
            <input type="text" name="username" id="username" className="form-control input-lg" placeholder="Your User Name" />
            <input type="text" name="email" id="email" className="form-control input-lg" placeholder="Your Email" />
            <input type="password" name="password" id="user_password" className="form-control input-lg" placeholder="Password" />
            <input type="password" name="confirm_password" className="form-control input-lg" placeholder="Confirm Password" />
            <text> Birth Date </text>
            <div className="row">
              <div className="col-xs-4 col-md-4">
                <select name="month" className="form-control input-lg">
                  {getMonthOptions()}
                </select>
              </div>

              <div className="col-xs-4 col-md-4">
                <select name="day" className="form-control input-lg">
                  {getDaysOptions()}
                </select>
              </div>
              <div className="col-xs-4 col-md-4">

                <select name="year" className="form-control input-lg">
                  {allowedYears()}
                </select>
              </div>
            </div>
            <text>Gender : </text>
            <label className="radio-inline" htmlFor="gender">
              <input type="radio" name="gender" value="M" id="male" />
              Male
            </label>
            <label className="radio-inline" htmlFor="gender">
              <input type="radio" name="gender" value="F" id="female" />
              Female
            </label>

            <div className="row help-block" style={{ marginLeft: '0px' }}>
              <label className="container col-lg-2" htmlFor="term">
                <input type="checkbox" />
                <span className="checkmark" />
              </label>
              <span className="col-lg-10">By clicking Create my account, you agree to our Terms and that you have read our Data Use Policy, including our Cookie Use.</span>
            </div>
            <button className="btn btn-lg btn-primary btn-block" type="submit">Create my account</button>
          </form>
        </div>
      </div>
    </div>
  );
}
