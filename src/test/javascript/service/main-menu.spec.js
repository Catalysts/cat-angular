/**
 * Created by tscheinecker on 31.03.2014.
 */

// actual spec
describe('Main Menu Service', function () {
    'use strict';

    var $mainMenuProvider;
    var testMenus = [
        {
            id: 'test.menu.1',
            options: {
                name: 'Test Menu 1'
            }
        },
        {
            id: 'test.menu.2',
            options: {
                name: 'Test Menu 2'
            }
        }
    ];

    var testMenuGroups = {
        'test.menu.1': [
            {
                id: 'group.1.1',
                name: 'Group Name 1.1'
            },
            {
                id: 'group.1.2',
                name: 'Group Name 1.2'
            }
        ],
        'test.menu.2': [
            {
                id: 'group.2.1',
                name: 'Group Name 2.1'
            },
            {
                id: 'group.2.2',
                name: 'Group Name 2.2'
            }
        ]
    };

    var testMenuEntries = {
        'test.menu.1': {
            'group.1.1': [
                {
                    id: 'entry.1.1.1',
                    name: 'Test Menu 1.1.1',
                    path: '/test/menu/1/1/1',
                    keymap: 'Alt + 1'
                },
                {
                    id: 'entry.1.1.2',
                    name: 'Test Menu 1.1.2',
                    path: '/test/menu/1/1/2',
                    testProperty: 'myTestPropertyValue'
                }
            ],
            'group.1.2': [
                {
                    id: 'entry.1.2.1',
                    name: 'Test Menu 1.2.1',
                    path: '/test/menu/1/2/1'
                }
            ]
        },
        'test.menu.2': {
            'group.2.1': [
                {
                    id: 'entry.2.1.1',
                    name: 'Test Menu 2.1.1',
                    path: '/test/menu/2/1/1',
                    keymap: 'Alt + 2'
                },
                {
                    id: 'entry.2.1.2',
                    name: 'Test Menu 2.1.2',
                    path: '/test/menu/2/1/2',
                    rights: 'TestRight'
                },
                {
                    id: 'entry.2.1.3',
                    name: 'Test Menu 2.1.3',
                    path: '/test/menu/2/1/3'
                }
            ]
        }
    };

    /**
     * Helper function to configure the main menu provider correctly
     * @param menus a list of menus to configure
     * @param groups a map of groups to configure
     * @param entries a map of menu entries
     * @returns {*}
     */
    var configureMenu = function (menus, groups, entries) {
        var $mainMenu;

        if (!!menus) {
            // add all top level menu entries
            for (var menuIndex = 0; menuIndex < menus.length; menuIndex++) {
                var menu = menus[menuIndex];
                $mainMenuProvider.menu(menu.id, menu.options);
                // add all groups for this id
                if (!!groups && !!groups[menu.id]) {
                    var groupEntries = groups[menu.id];
                    for (var groupIndex = 0; groupIndex < groupEntries.length; groupIndex++) {
                        var groupEntry = groupEntries[groupIndex];
                        $mainMenuProvider.menuGroup(menu.id, groupEntry.id, groupEntry);

                        // add all menu entries for this menu and group
                        if (!!entries && !!entries[menu.id] && !!entries[menu.id][groupEntry.id]) {
                            var menuEntries = entries[menu.id][groupEntry.id];
                            for (var entryIndex = 0; entryIndex < menuEntries.length; entryIndex++) {
                                var menuEntry = menuEntries[entryIndex];
                                $mainMenuProvider.menuEntry(menu.id, groupEntry.id, menuEntry.id, menuEntry);
                            }
                        }
                    }
                }
            }
        }

        inject(function (_$mainMenu_) {
            $mainMenu = _$mainMenu_;
        });

        expect($mainMenu).not.toBeUndefined();
        return $mainMenu;
    };

    beforeEach(function () {

        angular.module('cat.service.test', [])
            .config(function (_$mainMenuProvider_) {
                $mainMenuProvider = _$mainMenuProvider_;
            });

        module('cat.service');
        module('cat.service.test');

        // Kickstart the injectors previously registered
        // with calls to angular.mock.module
        inject(function () {
        });

        expect($mainMenuProvider).not.toBeUndefined();
    });

    it('should not contain any menus by default', function () {
        var $mainMenu = configureMenu();

        expect($mainMenu).not.toBeUndefined();
        var menus = $mainMenu.getMenus();
        expect(menus).not.toBeNull();
        expect(menus.length).toBe(0);
    });

    it('should return all defined menus', function () {
        var $mainMenu = configureMenu(testMenus);

        var menus = $mainMenu.getMenus();
        expect(menus).not.toBeNull();
        expect(menus.length).toBe(2);
        expect(menus[0]).not.toBeNull();
        expect(menus[0].id).toBe('test.menu.1');
        expect(menus[0].getOptions().name).toBe('Test Menu 1');
        expect(menus[0].getGroups()).not.toBeUndefined();
        expect(menus[0].getGroups().length).toBe(0);
        expect(menus[0].getFlattened()).not.toBeUndefined();
        expect(menus[0].getFlattened().length).toBe(0);
        expect(menus[1]).not.toBeNull();
        expect(menus[1].id).toBe('test.menu.2');
        expect(menus[1].getOptions().name).toBe('Test Menu 2');
        expect(menus[1].getGroups()).not.toBeUndefined();
        expect(menus[1].getGroups().length).toBe(0);
        expect(menus[1].getFlattened()).not.toBeUndefined();
        expect(menus[1].getFlattened().length).toBe(0);
    });

    it('should return all defined groups', function () {
        var $mainMenu = configureMenu(testMenus, testMenuGroups);

        var menus = $mainMenu.getMenus();
        var testMenu1 = menus[0];
        var testMenu1entries = testMenu1.getGroups();
        expect(testMenu1entries).not.toBeUndefined();
        expect(testMenu1entries.length).toBe(2);

        expect(testMenu1entries[0]).not.toBeUndefined();
        expect(testMenu1entries[0].id).toEqual(testMenuGroups[testMenu1.id][0].id);
        expect(testMenu1entries[0].getOptions()).toEqual(testMenuGroups[testMenu1.id][0]);
        expect(testMenu1entries[0].getEntries()).not.toBeUndefined();
        expect(testMenu1entries[0].getEntries().length).toBe(0);

        expect(testMenu1entries[1]).not.toBeUndefined();
        expect(testMenu1entries[1].id).toEqual(testMenuGroups[testMenu1.id][1].id);
        expect(testMenu1entries[1].getOptions()).toEqual(testMenuGroups[testMenu1.id][1]);

        var testMenu2 = menus[1];
        var testMenu2entries = testMenu2.getGroups();
        expect(testMenu2entries).not.toBeUndefined();
        expect(testMenu2entries.length).toBe(2);

        expect(testMenu2entries[0]).not.toBeUndefined();
        expect(testMenu2entries[0].id).toEqual(testMenuGroups[testMenu2.id][0].id);
        expect(testMenu2entries[0].getOptions()).toEqual(testMenuGroups[testMenu2.id][0]);
        expect(testMenu2entries[0].getEntries()).not.toBeUndefined();
        expect(testMenu2entries[0].getEntries().length).toBe(0);

        expect(testMenu2entries[1]).not.toBeUndefined();
        expect(testMenu2entries[1].id).toEqual(testMenuGroups[testMenu2.id][1].id);
        expect(testMenu2entries[1].getOptions()).toEqual(testMenuGroups[testMenu2.id][1]);
    });

    it('should return all defined menu entries', function () {
        var $mainMenu = configureMenu(testMenus, testMenuGroups, testMenuEntries);

        var menus = $mainMenu.getMenus();
        var testMenu1 = menus[0];
        var testMenu1groups = testMenu1.getGroups();
        var testMenu1group1 = testMenu1groups[0];
        var testMenu1group1entries = testMenu1group1.getEntries();
        expect(testMenu1group1entries).not.toBeUndefined();
        expect(testMenu1group1entries.length).toBe(2);

        expect(testMenu1group1entries[0]).not.toBeUndefined();
        expect(testMenu1group1entries[0].getOptions()).toEqual(testMenuEntries[testMenu1.id][testMenu1group1.id][0]);

        expect(testMenu1group1entries[1]).not.toBeUndefined();
        expect(testMenu1group1entries[1].getOptions()).toEqual(testMenuEntries[testMenu1.id][testMenu1group1.id][1]);

        var testMenu1group2 = testMenu1groups[1];
        var testMenu1group2entries = testMenu1group2.getEntries();
        expect(testMenu1group2entries).not.toBeUndefined();
        expect(testMenu1group2entries.length).toBe(1);

        expect(testMenu1group2entries[0]).not.toBeUndefined();
        expect(testMenu1group2entries[0].getOptions()).toEqual(testMenuEntries[testMenu1.id][testMenu1group2.id][0]);

        var testMenu2 = menus[1];
        var testMenu2groups = testMenu2.getGroups();
        var testMenu2group1 = testMenu2groups[0];
        var testMenu2group1entries = testMenu2group1.getEntries();
        expect(testMenu2group1entries).not.toBeUndefined();
        expect(testMenu2group1entries.length).toBe(3);

        expect(testMenu2group1entries[0]).not.toBeUndefined();
        expect(testMenu2group1entries[0].getOptions()).toEqual(testMenuEntries[testMenu2.id][testMenu2group1.id][0]);

        expect(testMenu2group1entries[1]).not.toBeUndefined();
        expect(testMenu2group1entries[1].getOptions()).toEqual(testMenuEntries[testMenu2.id][testMenu2group1.id][1]);

        expect(testMenu2group1entries[2]).not.toBeUndefined();
        expect(testMenu2group1entries[2].getOptions()).toEqual(testMenuEntries[testMenu2.id][testMenu2group1.id][2]);
    });
});