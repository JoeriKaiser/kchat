export interface ChatClasses {
  container: string;
  title: string;
  message: string;
  timestamp: string;
}

export const createChatClasses = (isActive: boolean): ChatClasses => ({
  container: `p-4 border-b border-timberwolf-200 cursor-pointer transition-colors hover:bg-isabelline-600 group ${isActive ? "bg-champagne_pink-500" : ""
    }`,
  title: `font-medium truncate ${isActive ? "text-timberwolf-100" : "text-timberwolf-200"
    }`,
  message: `text-sm truncate ${isActive ? "text-timberwolf-200" : "text-timberwolf-400"
    }`,
  timestamp: `text-xs mt-1 ${isActive ? "text-timberwolf-300" : "text-timberwolf-500"
    }`,
});