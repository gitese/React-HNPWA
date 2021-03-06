import React,{Component} from 'react';
import {connect} from 'react-redux';
import Link from 'next/link'
import PropTypes from 'prop-types';
import {withRouter} from 'next/router';

import notificationService from '../shared/services/notification.service';
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import swal from 'sweetalert2';
import * as feedActions from '../redux/actions/feed.actions';
import Layout from '../components/layout';
import Spinner from '../components/spinner';
import Comment from '../components/comment';


class Feed extends Component {


    constructor(props){
        super(props);

        this.destroy$ = new Subject();
    }


    componentWillMount(){

        notificationService.dispatchError$
                           .pipe(takeUntil(this.destroy$))
                            .subscribe((error)=>{
                                
                                swal({
                                  title: error.title,
                                  text: error.text,
                                  type: 'error',
                                  toast: false,
                                  allowOutsideClick: false,
                                  allowEscapeKey: false
                                });
                            });
    }

    componentDidMount(){
        let params = {id: this.props.router.query.id};
        this.props.fetchStory(params);
    }


    render() {

        const kids = (this.props.item.kids) ? this.props.item.kids : [];
        const commentsList = kids.map((kid,index)=>{
            return <Comment key={index} comment={kid}/>
        });

        return (

            <Layout>
            {this.props.loading && <Spinner/>}
            {
                !this.props.loading && this.props.item.title &&  
                <div className="item">
                    <div className="header card">
                        <h3> { this.props.item.title }</h3>
                        <p>
                            { this.props.item.score } points by
                            <Link as={`/user/${this.props.item.by}`} href={`/user?id=${this.props.item.by}`}>
                                <a className="user">  { this.props.item.by }  </a>
                            </Link>
                            | { this.props.item.kids.length || 0 } comments
                        </p>
                    </div>
                    {
                        this.props.item && kids.length &&  
                      
                        <div className="comment-wrapper">
                            {commentsList}
                        </div>
                    }
                    
                </div>
            }
            </Layout>  
        );
    }


    componentWillUnmount(){

        this.destroy$.next(true);
        // Now let's also unsubscribe from the subject itself:
        this.destroy$.unsubscribe();
    }
};

Feed.propTypes = {
    item: PropTypes.object,
    loading: PropTypes.bool
};

const mapStateToProps = state => {
 
  return { 
    item: state.feedState.story,
    loading: state.feedState.loading
  };
};

const mapDispatchToProps = dispatch => {
    return {
          fetchStory: (payload) => dispatch(feedActions.loadItemAction(payload)),
    };
};
export default withRouter(connect(mapStateToProps,mapDispatchToProps)(Feed));
