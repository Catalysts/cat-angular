interface IMainMenuProvider extends IServiceProvider {
    menu(moduleId:string, options:any):void;
    menuGroup(moduleId:string, groupId:string, options:any):void;
    menuEntry(moduleId:string, groupId:string, entryId:string, options:any):void;
}

interface IMenuEntry {
    completeId:string;
    getOptions():any;
    isGroup():boolean;
    isMenu():boolean;
}

class MenuEntry implements IMenuEntry {
    completeId:string;

    constructor(private id:string,
                private options:any,
                parent:MenuGroup|Menu) {
        this.completeId = `${parent.completeId}.${id}`
    }

    getOptions() {
        return this.options;
    }

    isGroup() {
        return false;
    }

    isMenu() {
        return false;
    }
}

class MenuGroup implements IMenuEntry {
    completeId:string;
    private menuEntries:Array<MenuEntry> = [];

    constructor(private id:string,
                private options:any,
                parent:IMenuEntry) {
        this.completeId = `${parent.completeId}.${id}`
    }

    addMenuEntry(menuEntryId:string, options:any) {
        this.menuEntries.push(new MenuEntry(menuEntryId, options, this));
    }

    getOptions() {
        return this.options;
    }

    getEntries() {
        return _.sortBy(this.menuEntries, function (entry) {
            return entry.getOptions().sortOrder || 10000;
        });
    }

    isGroup() {
        return true;
    }

    isMenu() {
        return false;
    }

    isSubMenu() {
        return (this.options.displayAsSubMenu === true);
    }
}

class Menu implements IMenuEntry {
    completeId:string;
    private menuEntries:Array<MenuEntry> = [];
    private menuGroups:{[key:string]:MenuGroup} = {};

    constructor(private id:string,
                private options:any) {
        this.completeId = id;
    }

    addMenuGroup(groupId, options) {
        this.menuGroups[groupId] = new MenuGroup(groupId, options, this);
    }

    addMenuEntry(groupId, menuEntryId, options) {
        if (_.isUndefined(groupId)) {
            this.menuEntries.push(new MenuEntry(menuEntryId, options, this));
        } else {
            this.menuGroups[groupId].addMenuEntry(menuEntryId, options);
        }
    }

    getGroups():Array<MenuGroup> {
        return _.sortBy(_.map(this.menuGroups, (menuGroup:MenuGroup) => {
            return menuGroup;
        }), function (menuGroup:MenuGroup) {
            return menuGroup.getOptions().sortOrder || 10000;
        });
    }

    getEntries(groupId) {
        if (_.isUndefined(groupId)) {
            return _.sortBy(this.menuEntries, (entry) => {
                return entry.getOptions().sortOrder || 10000;
            });
        }
        return this.menuGroups[groupId].getEntries();
    }

    getFlattened() {
        return _.flatten<any>([this.menuEntries, _.map(this.getGroups(), (group:any) => {
            if (group.getOptions().displayAsSubMenu === true) {
                group.subEntries = group.getEntries();
                return [group];
            } else {
                return [group, group.getEntries()];
            }
        })], !!_.flattenDeep);
    }

    isMenu() {
        return true;
    }

    isGroup() {
        return false;
    }

    getOptions() {
        return this.options;
    }
}

interface ICatMainMenuService {
    getMenus():Menu[];
}

class MenuBar {
    private menus:{[key:string]:Menu} = {};

    constructor(private id:string,
                private options:any) {
    }

    addMenu(menuId, options) {
        this.menus[menuId] = new Menu(menuId, options);
    }

    addMenuGroup(menuId, groupId, options) {
        this.menus[menuId].addMenuGroup(groupId, options);
    }

    addMenuEntry(menuId, groupId, menuEntryId, options) {
        this.menus[menuId].addMenuEntry(groupId, menuEntryId, options);
    }

    getMenus() {
        return _.map(this.menus, function (menu) {
            return menu;
        });
    }

    getOptions() {
        return this.options;
    }
}

/**
 * @ngdoc service
 * @name cat.service.menu:$mainMenu
 * @constructor
 */
class MainMenuProvider implements IMainMenuProvider {
    private mainMenu = new MenuBar('main.menu', {});
    menus = [];
    private _groups = [];
    private _entries = [];

    menu(moduleId, options) {
        this.menus.push({
            menuId: moduleId,
            options: options
        });
    }

    menuGroup(moduleId, groupId, options) {
        this._groups.push({
            menuId: moduleId,
            groupId: groupId,
            options: options
        });
    }

    menuEntry(moduleId, groupId, entryId, options) {
        if (_.isUndefined(options)) {
            options = entryId;
            entryId = groupId;
            groupId = undefined;
        }
        this._entries.push({
            menuId: moduleId,
            groupId: groupId,
            entryId: entryId,
            options: options
        });
    }

    $get() {
        _.forEach(this.menus, (menu) => {
            this.mainMenu.addMenu(menu.menuId, menu.options);
        });

        _.forEach(this._groups, (group) => {
            this.mainMenu.addMenuGroup(group.menuId, group.groupId, group.options);
        });

        _.forEach(this._entries, (entry) => {
            this.mainMenu.addMenuEntry(entry.menuId, entry.groupId, entry.entryId, entry.options);
        });

        return this.mainMenu;
    }
}

angular
    .module('cat.service.menu', [])
    .provider('$mainMenu', [
        MainMenuProvider
    ]);
