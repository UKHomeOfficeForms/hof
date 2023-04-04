/* eslint max-len: 0 */

'use strict';

module.exports = {
  getstaticAppealStages: function () {
    return [
      { value: 'FT_IC',
        label: '01. First Tier IAC Appeal - In Country Appeals',
        timeLimit: {value: 14, type: 'calendar days'},
        startDateLabel: 'Date refusal letter sent by HO',
        rules: 'The Tribunal Procedure (First-tier tribunal) (Immigration and Asylum Chamber) Rules 2014',
        ruleNumber: '19(2)',
        adminAllowance: {value: 1, type: 'working day'},
        country: 'All',
        trigger: 'Refusal Notice',
        sortCode: 10
      },

      { value: 'FT_OOC_1',
        label: '02. First Tier IAC Appeal - Out of Country Appeals where the appellant must leave the UK before appealing',
        timeLimit: {value: 28, type: 'calendar days'},
        startDateLabel: 'Appellant\'s date of departure',
        rules: 'The Tribunal Procedure (First-tier tribunal) (Immigration and Asylum Chamber) Rules 2014',
        ruleNumber: '19(3)(a)',
        adminAllowance: {value: 0, type: 'working days'},
        country: 'All',
        trigger: 'Refusal Notice',
        sortCode: 20
      },

      { value: 'FT_OOC_2',
        label: '03. First Tier IAC Appeal - Other out of Country Appeals (e.g Voluntary Departure)',
        timeLimit: {value: 28, type: 'calendar days'},
        startDateLabel: 'Date of receipt of the refusal letter',
        rules: 'The Tribunal Procedure (First-tier tribunal) (Immigration and Asylum Chamber) Rules 2014',
        ruleNumber: '19(3)(b)',
        adminAllowance: {value: 1, type: 'working days'},
        country: 'All',
        trigger: 'Refusal Notice',
        sortCode: 30
      },

      { value: 'FT_IC_FAST',
        label: '04. First Tier IAC Appeal - In Country Detained Fast Track',
        timeLimit: {value: 2, type: 'working days'},
        startDateLabel: 'Date when appellant was provided notice of decision',
        rules: 'The Tribunal Procedure (First-tier tribunal) (Immigration and Asylum Chamber) Rules 2014 Schedule The Fast Track Rules',
        ruleNumber: '5(1)',
        adminAllowance: {value: 1, type: 'working day'},
        country: 'All',
        trigger: 'Refusal Notice',
        sortCode: 40
      },

      { value: 'FT_UT_IC',
        label: '05. First Tier IAC PTA to the UT - In Country',
        timeLimit: {value: 14, type: 'calendar days'},
        startDateLabel: 'Date written reasons for the decision sent',
        rules: 'The Tribunal Procedure (First-tier tribunal) (Immigration and Asylum Chamber) Rules 2014',
        ruleNumber: '33(2)',
        adminAllowance: {value: 1, type: 'working day'},
        country: 'All',
        trigger: 'IA60 first tier dismissed',
        sortCode: 50
      },

      { value: 'FT_UT_OOC',
        label: '06. First Tier IAC PTA to the UT - Out of Country',
        timeLimit: {value: 28, type: 'calendar days'},
        startDateLabel: 'Date written reasons for the decision sent',
        rules: 'The Tribunal Procedure (First-tier tribunal) (Immigration and Asylum Chamber) Rules 2014',
        ruleNumber: '33(3)',
        adminAllowance: {value: 1, type: 'working day'},
        country: 'All',
        trigger: 'IA60 first tier dismissed',
        sortCode: 60
      },

      { value: 'FT_UT_FAST',
        label: '07. First Tier IAC PTA to the UT - Detained Fast Track',
        timeLimit: {value: 3, type: 'working days'},
        startDateLabel: 'Date when appellant was provided notice of decision',
        rules: 'The Tribunal Procedure (First-tier tribunal) (Immigration and Asylum Chamber) Rules 2014 Schedule The Fast Track Rules',
        ruleNumber: '11',
        adminAllowance: {value: 1, type: 'working day'},
        country: 'All',
        trigger: 'IA60 first tier dismissed',
        sortCode: 70
      },

      { value: 'UT_IC',
        label: '08. Upper Tribunal IAC PTA - In Country',
        timeLimit: {value: 14, type: 'calendar days'},
        startDateLabel: 'Date when the FtT refused FTPA',
        rules: 'The Tribunal Procedure (Upper Tribunal) Rules 2008',
        ruleNumber: '21(3)(a)(aa)(i)',
        adminAllowance: {value: 1, type: 'working day'},
        country: 'All',
        trigger: 'IA67 first tier permission to appeal refused',
        sortCode: 80
      },

      { value: 'UT_OOC',
        label: '09. Upper Tribunal IAC PTA - Out of Country',
        timeLimit: {value: 1, type: 'calendar month'},
        startDateLabel: 'Date when the FtT refused FTPA',
        rules: 'The Tribunal Procedure (Upper Tribunal) Rules 2008',
        ruleNumber: '21(3)(b)',
        adminAllowance: {value: 1, type: 'working day'},
        country: 'All',
        trigger: 'IA67 first tier permission to appeal refused',
        sortCode: 90
      },

      { value: 'UT_IAC_JR',
        label: '10. Upper Tribunal IAC - Judicial Review',
        timeLimit: {value: 3, type: 'calendar months'},
        startDateLabel: 'Date of decision of the First Tier Tribunal or Home Office',
        rules: 'The Tribunal Procedure (Upper Tribunal) Rules 2008',
        ruleNumber: '28(2)',
        adminAllowance: {value: 0, type: 'working days'},
        country: 'All',
        trigger: 'n/a',
        sortCode: 100
      },

      { value: 'UT_IAC_IC',
        label: '11. Upper Tribunal IAC - In Country PTA to review UT determination',
        timeLimit: {value: 12, type: 'calendar days'},
        startDateLabel: 'Date when appellant was sent notice of decision',
        rules: 'The Tribunal Procedure (Upper Tribunal) Rules 2008',
        ruleNumber: '44(3B)(a)(i)',
        adminAllowance: {value: 1, type: 'working day'},
        country: 'All',
        trigger: 'IA150 - Upper Tier determination (dismissed)',
        sortCode: 110
      },

      { value: 'UT_IAC_OOC',
        label: '12. Upper Tribunal IAC - Out of Country PTA to review UT determination',
        timeLimit: {value: 38, type: 'calendar days'},
        startDateLabel: 'Date when appellant was sent notice of decision',
        rules: 'The Tribunal Procedure (Upper Tribunal) Rules 2008',
        ruleNumber: '44(3B)(b)',
        adminAllowance: {value: 1, type: 'working day'},
        country: 'All',
        trigger: 'IA150 - Upper Tier determination (dismissed)',
        sortCode: 120
      },

      { value: 'COA_IAC',
        label: '13. Court of Appeal via IAC',
        timeLimit: {value: 28 + 2, type: 'calendar days'},
        startDateLabel: 'Date when appellant was sent notice of decision',
        rules: 'Civil Procedure Rules',
        ruleNumber: '52.4',
        adminAllowance: {value: 1, type: 'working days'},
        country: ['England & Wales'],
        trigger: 'IA157 PTA to the CoA refused',
        sortCode: 130
      },

      { value: 'COS_IAC',
        label: '14. Court of Sessions via IAC',
        timeLimit: {value: 42 + 1, type: 'calendar days'},
        startDateLabel: 'Date when appellant was sent notice of decision',
        rules: 'Civil Procedure Rules',
        ruleNumber: 'Rule 41.20',
        adminAllowance: {value: 1, type: 'working days'},
        country: ['Scotland', 'Northern Ireland'],
        trigger: 'IA157 PTA to the CoA refused',
        sortCode: 140
      },

      { value: 'COA_DIRECT',
        label: '15. Court of Appeal Direct',
        timeLimit: {value: 7 + 2, type: 'calendar days'},
        startDateLabel: 'Date when appellant was sent notice of decision',
        rules: 'Civil Procedure Rules',
        ruleNumber: '52.3',
        adminAllowance: {value: 1, type: 'working days'},
        country: 'All',
        trigger: 'IA157 PTA to the CoA refused',
        sortCode: 150
      }
    ];
  }
};
