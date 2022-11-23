import discord
from discord.ext import commands


class ErrorHandler(commands.Cog):
    def __init__(self, bot: discord.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_application_command_error(self, ctx: discord.ApplicationContext, error: discord.DiscordException):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send_response("You do not have the required permission(s) to use this command.", ephemeral=True)
        elif isinstance(error, discord.Forbidden):
            await ctx.send_response(
                "This action is forbidden. You may lack required permissions to perform it",
                ephemeral=True
            )
        else:
            print(f"{ctx.user} tried to use {ctx.command.name} which resulted in {error}")


def setup(bot: discord.Bot):
    bot.add_cog(ErrorHandler(bot))
