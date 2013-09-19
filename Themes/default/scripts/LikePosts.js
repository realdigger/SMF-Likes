/**
* @package manifest file for Like Posts
* @version 1.1.1
* @author Joker (http://www.simplemachines.org/community/index.php?action=profile;u=226111)
* @copyright Copyright (c) 2012, Siddhartha Gupta
* @license http://www.mozilla.org/MPL/MPL-1.1.html
*/

/*
* Version: MPL 1.1
*
* The contents of this file are subject to the Mozilla Public License Version
* 1.1 (the "License"); you may not use this file except in compliance with
* the License. You may obtain a copy of the License at
* http://www.mozilla.org/MPL/
*
* Software distributed under the License is distributed on an "AS IS" basis,
* WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
* for the specific language governing rights and limitations under the
* License.
*
* The Initial Developer of the Original Code is
*  Joker (http://www.simplemachines.org/community/index.php?action=profile;u=226111)
* Portions created by the Initial Developer are Copyright (C) 2012
* the Initial Developer. All Rights Reserved.
*
* Contributor(s):
*
*/

var likePosts = function() {
    this.timeoutTimer = null;
};

likePosts.prototype.likeUnlikePosts = function(mId, tId, bId) {
    // Lets try JS validations
    msgId = (mId !== undefined) ? parseInt(mId, 10) : 0;
    topicId = (tId !== undefined) ? parseInt(tId, 10) : 0;
    boardId = (bId !== undefined) ? parseInt(bId, 10) : 0;
    var rating = (lpObj.jQRef('#like_' + msgId).text().toLowerCase() == 'like') ? 1 : 0;

    if (isNaN(msgId) || isNaN(topicId) || isNaN(boardId)) {
        return false;
    }

    lpObj.jQRef.ajax({
        type: "POST",
        url: smf_scripturl + '?action=likeposts;sa=like_post',
        context: document.body,
        dataType : "json",
        data: {
            msg: msgId,
            topic: topicId,
            board: boardId,
            rating: rating
        },

        success: function(resp) {
            if (resp.response) {
                var params = {
                    msgId: msgId,
                    count: (resp.count !== undefined) ? resp.count : '',
                    newText: resp.newText,
                    likeText: resp.likeText,
                    image_path: resp.image_path
                };
                lpObj.onLikeSuccess(params);
            } else {
                //NOTE: Make an error callback over here
            }
        }
    });
    return true;
};

likePosts.prototype.onLikeSuccess = function(params) {
    var count = parseInt(params.count, 10);
    if(isNaN(count)) return false;

    var likeButtonRef = lpObj.jQRef('#like_' + params.msgId),
        likeText = params.likeText;

    if(likeText.indexOf('&amp;') > 0) {
        likeText = likeText.replace(/&amp;/g, '&');
    }

    lpObj.jQRef(likeButtonRef).animate({
        left: '-40px',
        opacity: 'toggle'
    }, 1000, '', function() {
        lpObj.jQRef(likeButtonRef).text(params.newText);

        lpObj.jQRef(likeButtonRef).animate({
            left: '0px',
            opacity: 'toggle'
        }, 1000);
    });

    if(lpObj.jQRef('#like_count_' + params.msgId).length) {
        if(likeText === '') {
            lpObj.jQRef('#like_count_' + params.msgId).fadeOut(2000).remove();
        } else {
            lpObj.jQRef('#like_count_' + params.msgId).fadeOut(1000, function() {
                lpObj.jQRef(this).text('(' + likeText + ')').fadeIn(1000);
            });
        }
    } else {
        lpObj.jQRef('<span class="display_inline" id="like_count_' + params.msgId +'">('+ likeText + ')</span>').hide().appendTo('#like_post_info_' + params.msgId).fadeIn(2000);
    }

    this.timeoutTimer = setTimeout(function() {
        lpObj.removeOverlay();
    }, 3000);
};

likePosts.prototype.showMessageLikedInfo = function(messageId) {
    if(isNaN(messageId)) return false;

    lpObj.jQRef.ajax({
        type: "GET",
        url: smf_scripturl + '?action=likeposts;sa=get_message_like_info',
        context: document.body,
        dataType : "json",
        data: {
            msg_id: messageId
        },

        success: function(resp) {
            if (resp.response) {
                if(resp.data.length <= 0) return false;

                var data = resp.data;
                var memberInfo = '';
                for(var i in data) {
                    memberInfo += '<div class="like_posts_member_info"><img class="avatar" src="'+ data[i].avatar.href +'" /><div class="like_posts_member_info_details"><a href="'+ data[i].href +'">' + data[i].name + '</a></div></div>';
                }
                var completeString = '<div class="like_posts_overlay"><div class="like_posts_member_info_box">' + memberInfo + '</div></div>';

                lpObj.jQRef('body').append(completeString);
                lpObj.jQRef(document).one('click keyup', lpObj.removeOverlay);

                lpObj.jQRef('.like_posts_member_info_box').click(function(e){
                    e.stopPropagation();
                });
            } else {
                //NOTE: Make an error callback over here
                return false;
            }
        }
    });
};

likePosts.prototype.bouncEffect = function (element, direction, times, distance, speed) {
    var dir = 'marginLeft';

    switch (direction) {
        case 'rl':
            dir = 'marginRight';
            break;

        case 'tb':
            dir = 'marginTop';
            break;

        case 'bt':
            dir = 'marginBottom';
            break;

        default:
            break;
    }
    var anim1 = {};
    anim1[dir] = '+=' + distance;

    var anim2 = {};
    anim2[dir] = '-=' + distance;

    for (var i = 0; i < times; i++) {
        element.animate(anim1, speed).animate(anim2, speed);
    }
};

// some admin related functions
likePosts.prototype.recountStats = function(options) {
    // debugger;
    if(!options.activity) return false;

    var activity = options.activity,
        currentCounter = options.currentCounter || 0,
        totalWork = options.totalWork || 0;

    lpObj.jQRef.ajax({
        type: "POST",
        url: smf_scripturl + '?action=admin;area=likeposts;sa=recountlikestats',
        dataType : "json",
        data: {
            'activity': activity,
            'totalWork': totalWork,
            'currentCounter': currentCounter
        },

        success: function(resp) {
            console.log(resp);
        }, error: function(err) {
            console.log(err);
        }
    });
};

likePosts.prototype.removeOverlay = function (e) {
    var _this = this;
    if(typeof(e) === undefined && this.timeoutTimer === null) return false;
    else if (this.timeoutTimer !== null || ((e.type == 'keyup' && e.keyCode == 27) || e.type == 'click')) {
        clearTimeout(_this.timeoutTimer);
        _this.timeoutTimer = null;
        lpObj.jQRef('.like_posts_overlay').remove();
        lpObj.jQRef('.like_posts_overlay').unbind('click');
        lpObj.jQRef(document).unbind('click', lpObj.removeOverlay);
        lpObj.jQRef(document).unbind('keyup', lpObj.removeOverlay);
    }
};

likePosts.prototype.showPercentage = function (obj) {
    var _this = this;
    lpObj.jQRef('.like_posts_overlay').remove();
};

var lpObj = window.lpObj = new likePosts();
if(!lpObj.jQRef) {
    lpObj.jQRef = jQuery.noConflict(true);
}

(function() {
    lpObj.jQRef(document).ready(function() {
        lpObj.jQRef(".some_data").hover(function(e) {
            e.preventDefault();
            var currText = lpObj.jQRef(this).next().html();

            lpObj.jQRef("<div class=\'subject_details\'></div>").html(currText).appendTo("body").fadeIn("slow");
        }).mouseout(function(){
            lpObj.jQRef(".subject_details").fadeOut("slow");
            lpObj.jQRef(".subject_details").remove();
        }).mousemove(function(e) {
            var mousex = e.pageX + 20,
                mousey = e.pageY + 10,
                width = lpObj.jQRef("#wrapper").width() - mousex - 50;

            lpObj.jQRef(".subject_details").css({
                top: mousey,
                left: mousex,
                width: width + "px"
            });
        });
    });
})();