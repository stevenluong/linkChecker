import React, { Component } from 'react';
import { Button,Grid, Row, Col,Table, Form } from 'react-bootstrap'
class Analysis extends Component {
    constructor() {
        super();
        this.state = {
            status:"",
            sent:false
        };
    }

    send(e){
        e.preventDefault();
        console.log("submit");
        //console.log(e.target.form.location.value);
        const formData = new FormData();
        var website = e.target.form.website.value;
        var email = e.target.form.email.value;
        if(!website || !email){
            this.setState({
                status:"Please fill email and website"  
            });
        }else{
            formData.append('email', email);
            formData.append('website', website);
            console.log(formData);
            fetch("http://slapps.fr:8089/", {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email:email,
                    website:website,
                })
            })
            .then(res=>{
                  this.setState({
                    status:"Request sent",
                    sent:true
                });
            })
        }


    }

    render(){
        return(
                <div>
                <h2>Analysis request</h2>
                {this.state.status===""?"":<p>{this.state.status}</p>}
                <Form>
                Website - <input type="text" name="website"/>
                <br/>
                Email - <input type="text" name="email"/>
                <br/>
                {!this.state.sent &&
                <Button type="submit" onClick={(e)=>this.send(e)}>Submit</Button>
                }
                </Form>
                </div>
              )
    }
}

export default Analysis;
