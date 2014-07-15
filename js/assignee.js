///////////////////////////////////////////////////////////
// (c)2013 fortissimo1997, all right reserved.
// author fortissimo1997, 2014/07/14
///////////////////////////////////////////////////////////

$(function(){
    var re = new RegExp("^https://github.com/([^/]+)/([^/]+)/.+$");
    var match = re.exec(document.location);
    if(!!match) {
        getIssue(null);
    }

    function getIssue(token) {
        var ajax_attr = {
            'url': 'https://api.github.com/repos/' + match[1] + '/' + match[2] +  '/issues?filter=all',
            'dataType': 'json',
            'type': 'GET',
            'success': createTable,
            'error': function() {
                $('#github-assignees-table').remove();
                var $div = createGithubAssigneesDiv();
                var input_string =  '<label for="github-assignees-token">Token:</label><input type="text" name="token" id="github-assignees-token" /><br />'
                        + '<button id="github-assignees-button">Get Assignees</button>';
                $('body').append($div.append('<p>Authentication is required!</p>' + input_string));
                $('#github-assignees-button').on('click', function() {
                    var token = $('#github-assignees-token').val();
                    getIssue(token);
                });
            },
            'beforeSend': function(xhr) {
                if(!!token) {
                    xhr.setRequestHeader('Authorization', 'token ' + token);
                }
            }
        };
        $.ajax(ajax_attr);
    }

    function createTable(data, dataType) {
        $('#github-assignees-table').remove();
        var assignees = data.filter(function(single) {
            return single.assignee && single.assignee.login;
        }).map(function(single) {
            return single.assignee;
        }).reduce(function(prev, curr) {
            if(prev.user_name.some(function(elem) { return elem == curr.login; })) {
                prev.details[prev.user_name.indexOf(curr.login)].count++;
            } else{
                prev.details.push({
                    'assignee': curr,
                    'count': 1
                });
                prev.user_name.push(curr.login);
            }
            return prev;
        }, {
            'user_name': [],
            'details': []
        });
        var $table = $('<table>')
                .css({'border': '1px #000 solid'})
                .append('<tr><th>avatar</th><th>user</th><th>count</th></tr>');
        for(var i = 0, len = assignees.details.length; i < len; i++) {
            var a = assignees.details[i];
            var $avatar = $('<img>');
            $avatar
                .attr('alt', a.assignee.login)
                .attr('width', 16)
                .attr('height', 16)
                .attr('src', a.assignee.avatar_url);
            var $avatar_td = $('<td>')
                    .append($avatar)
                    .attr('align', 'center');
            var $tr = $('<tr>')
                    .append($avatar_td)
                    .append($('<td>' + a.assignee.login + '</td>').attr('align', 'center'))
                    .append($('<td>' + a.count + '</td>').attr('align', 'center'));
            $table.append($tr);
        }
        var $div = createGithubAssigneesDiv();
        $div.append($table);
        $('body').append($div);
    }

    function createGithubAssigneesDiv() {
        return $('<div>')
            .attr('id', 'github-assignees-table')
            .css({
                'position': 'fixed',
                'top': '50px',
                'left': '0px',
                'margin': '10px'
            });
    }
});
