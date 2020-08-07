import React, { Component } from 'react';
import shortid from 'shortid';
import '../../app.css';

export default function Signup() { 

    function allowedYears()
    {
        var listOfYears = [];

        var cur_year = new Date();
        var minimum_age = 16;
        var max_age = 100;

        var last_year       = cur_year.getFullYear() - minimum_age; 
        var begginning_year = cur_year.getFullYear() - max_age;

        for (var year=begginning_year; year < last_year; year++) {
            listOfYears.push(<option key={shortid.generate()} value={year}> {year} </option>);
        }     

        return listOfYears;
    }

    function getMonthOptions()
    {
        var listOfMonths = [];
        var monthStrings = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dev"];

        for(var monthIndex=0; monthIndex<12; monthIndex++)
        {
            listOfMonths.push(<option key={shortid.generate()} value={monthIndex+1}> {monthStrings[monthIndex]} </option>);
        }

        return listOfMonths;
    }

    function getDaysOptions()
    {
        var listOfDays = [];

        for(var dayIndex = 1; dayIndex<=31; dayIndex++)
        {
            listOfDays.push(<option key={shortid.generate()} value={dayIndex}>{dayIndex}</option>);
        }

        return listOfDays;
    }
 
    return (
        <div className="container">
            <div className="row">
                <h2 className="offset-sm-3 col-sm-6 signup" >Signup</h2>
            </div>
            <div className="row">
                <div className="offset-sm-1 col-sm-2">
                </div>
                <div className="col-sm-6">
                    <form action="/signup" method="post" acceptCharset="utf-8" className="form" role="form">
                        <div className="row">
                            <div className="col-xs-6 col-md-6">
                                <input type="text" name="firstname" className="form-control input-lg" id="firstname" placeholder="First Name"  />                        </div>
                            <div className="col-xs-6 col-md-6">
                                <input type="text" name="lastname" className="form-control input-lg" id="lastname" placeholder="Last Name"  />                        </div>
                        </div>
                        <input type="text" name="username" id="username" className="form-control input-lg" placeholder="Your User Name"/>
                        <input type="text" name="email" id="email" className="form-control input-lg" placeholder="Your Email"/>
                        <input type="password" name="password" id="user_password" className="form-control input-lg" placeholder="Password" />
                        <input type="password" name="confirm_password"  className="form-control input-lg" placeholder="Confirm Password"  />
                        <label>Birth Date</label>
                        <div className="row">
                            <div className="col-xs-4 col-md-4">
                                <select name="month" className = "form-control input-lg">
                                    {getMonthOptions()}
                                </select>
                            </div>

                            <div className="col-xs-4 col-md-4">
                                <select name="day" className = "form-control input-lg">
                                    {getDaysOptions()}
                                </select>                        
                            </div>
                            <div className="col-xs-4 col-md-4">
                            
                                <select name="year" className = "form-control input-lg">
                                    {allowedYears()}
                                </select>
                            </div>
                        </div>
                        <label>Gender : </label>
                        <label className="radio-inline">
                            <input type="radio" name="gender" value="M" id="male" />Male
                        </label>
                        <label className="radio-inline">
                            <input type="radio" name="gender" value="F" id="female" />Female
                        </label>

                        <div className="row help-block" style={{marginLeft: '0px'}}>
                            <label className="container col-lg-2">
                              <input type="checkbox"/>
                              <span className="checkmark"></span>
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