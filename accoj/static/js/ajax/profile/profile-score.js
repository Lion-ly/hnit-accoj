$(document).ready(function () {
    _init_();
});

function _init_() {
    function getUserScore() {
        let data = {api: 'get_user_score'},
            url = '/profile_api';
        get_data(data, plotScoreChart, url);
    }

    function plotScoreChart(_data) {
        let _template = '<tr>' +
            '                                <td class="serial">1</td>' +
            '                                <td>Tiger Nixon</td>' +
            '                                <td>System Architect</td>' +
            '                                <td>550</td>' +
            '                                <td>10</td>' +
            '                                <td>20</td>' +
            '                                <td>30</td>' +
            '                                <td>40</td>' +
            '                                <td>50</td>' +
            '                                <td>60</td>' +
            '                                <td>70</td>' +
            '                                <td>80</td>' +
            '                                <td>90</td>' +
            '                                <td>100</td>' +
            '                            </tr>'
    }

    getUserScore();
}
